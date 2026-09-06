# Environment shared by interactive and non-interactive Zsh sessions.
typeset -U path PATH

path=(
  "$HOME/.local/bin"
  "$HOME/.local/opt/dev-tools/bin"
  "$HOME/.bun/bin"
  $path
)

if [[ "$(uname -s)" == "Linux" ]]; then
  path=("$HOME/.local/opt/nvim/bin" $path)
fi

export BUN_INSTALL="$HOME/.bun"
