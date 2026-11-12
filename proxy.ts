import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, createNonce } from "@/infrastructure/security/csp";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/infrastructure/supabase/env";

const AUTH_PAGES = ["/entrar", "/cadastro", "/recuperar-senha"];
/** Rotas em que o proxy confere a sessão do Supabase (as demais só recebem a CSP). */
const SESSION_PATHS = [...AUTH_PAGES, "/redefinir-senha"];

function needsSession(pathname: string): boolean {
  return pathname === "/painel" || pathname.startsWith("/painel/") || SESSION_PATHS.includes(pathname);
}

/**
 * 1. Monta a CSP com um nonce novo por requisição. O Next lê o nonce do header Content-Security-Policy
 *    da requisição e o aplica sozinho aos scripts dele; o x-nonce fica disponível para scripts próprios.
 * 2. Renova a sessão do Supabase e protege o painel no servidor.
 *    A autorização real dos dados continua na RLS do banco; isto só evita mostrar o painel a quem não entrou.
 */
export async function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === "development",
    supabaseUrl: SUPABASE_URL,
    turnstile: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const withCsp = <T extends NextResponse>(response: T): T => {
    response.headers.set("Content-Security-Policy", csp);
    return response;
  };
  const next = () => NextResponse.next({ request: { headers: requestHeaders } });

  const { pathname, search } = request.nextUrl;
  if (!needsSession(pathname)) return withCsp(next());

  if (!isSupabaseConfigured) {
    // Em produção o painel nunca abre sem o banco (não cai em armazenamento local).
    if (process.env.NODE_ENV === "production" && pathname.startsWith("/painel")) {
      return withCsp(NextResponse.redirect(new URL("/entrar", request.url)));
    }
    return withCsp(next());
  }

  let response = next();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        // Repassa os cookies renovados para a renderização, mantendo o nonce e a CSP da requisição.
        requestHeaders.set("cookie", request.headers.get("cookie") ?? "");
        response = next();
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Falha de rede ao validar a sessão conta como "não entrou": nunca derruba a página.
  const signedIn = await supabase.auth
    .getClaims()
    .then(({ data }) => Boolean(data?.claims?.sub))
    .catch(() => false);

  if (!signedIn && pathname.startsWith("/painel")) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return withCsp(NextResponse.redirect(url));
  }

  if (signedIn && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    url.search = "";
    return withCsp(NextResponse.redirect(url));
  }

  return withCsp(response);
}

export const config = {
  matcher: [
    // Todas as páginas e rotas de API; ficam de fora só os arquivos estáticos, que não executam nada.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm|woff2?|txt|xml|webmanifest)$).*)",
  ],
};
