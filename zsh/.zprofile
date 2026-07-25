if [[ "$(uname -s)" == "Darwin" ]]; then
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
fi

# Added by swiftly on macOS.
[[ -r "$HOME/.swiftly/env.sh" ]] && source "$HOME/.swiftly/env.sh"
