#!/usr/bin/env bash
# Confere os commits entre BASE e HEAD (os commits novos de um PR).
# Falha se algum commit tem:
#   - "Co-authored-by:" com e-mail fora de .github/coautores-permitidos.txt;
#   - a assinatura "Generated with ..." na mensagem.
# Uso: bash scripts/sem-coautor.sh <base> <head>
#      bash scripts/sem-coautor.sh origin/develop HEAD   (para conferir a sua branch antes do PR)
set -euo pipefail

BASE="${1:?informe a base (ex.: origin/develop)}"
HEAD="${2:-HEAD}"
RAIZ="$(git rev-parse --show-toplevel)"
PERMITIDOS="$RAIZ/.github/coautores-permitidos.txt"

permitido() {
  local email="$1"
  [ -f "$PERMITIDOS" ] || return 1
  grep -v '^\s*#' "$PERMITIDOS" | tr -d '\r' | grep -qixF -- "$email"
}

ruins=0
for sha in $(git rev-list "$BASE..$HEAD"); do
  mensagem="$(git log -1 --format='%B' "$sha")"
  titulo="$(git log -1 --format='%h %s' "$sha")"

  while IFS= read -r linha; do
    email="$(printf '%s' "$linha" | sed -nE 's/.*<([^>]+)>.*/\1/p')"
    if [ -z "$email" ] || ! permitido "$email"; then
      echo "::error::$titulo -> coautor não permitido: $linha"
      ruins=$((ruins + 1))
    fi
  done < <(printf '%s\n' "$mensagem" | grep -iE '^\s*co-authored-by:' || true)

  if printf '%s\n' "$mensagem" | grep -qiE 'generated with'; then
    echo "::error::$titulo -> mensagem com assinatura \"Generated with ...\""
    ruins=$((ruins + 1))
  fi
done

if [ "$ruins" -gt 0 ]; then
  echo ""
  echo "Encontrei $ruins problema(s). Tire a linha do commit (git commit --amend ou git rebase) e envie de novo."
  echo "Coautor de verdade (pessoa da equipe)? Coloque o e-mail em .github/coautores-permitidos.txt."
  exit 1
fi
echo "Nenhum coautor de ferramenta nos commits do PR."
