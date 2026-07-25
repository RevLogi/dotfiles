if [[ "$(uname -s)" == "Darwin" ]]; then
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
fi

typeset -U path PATH
path=(
  "$HOME/.local/bin"
  "$HOME/.local/opt/nvim/bin"
  "$HOME/.local/opt/dev-tools/bin"
  "$HOME/.local/share/bob/nvim-bin"
  "$HOME/.bun/bin"
  $path
)

# Added by swiftly
. "/Users/liuguangxi/.swiftly/env.sh"