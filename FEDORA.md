# Fedora Workstation Setup

This profile targets Fedora Asahi Remix on aarch64 with KDE Plasma and
Wayland. It deploys the portable terminal configuration and uses Fedora's
native packages rather than the macOS Brewfile.

## Packages

Install the terminal stack from Fedora's repositories:

```bash
sudo dnf install \
  zsh stow kitty tmux neovim gh fzf ripgrep fd-find eza zoxide fastfetch \
  bat btop htop ncdu
```

The Neovim configuration installs its remaining language tools through Mason.
Fedora's `fd-find` package provides the expected `fd` executable.

Install compiler tooling before initializing Neovim because Tree-sitter builds
its parsers locally. On Fedora Asahi this may also update compiler packages and
download Asahi kernel headers:

```bash
sudo dnf install gcc gcc-c++ clang clang-tools-extra
```

## Font

Kitty uses JetBrains Mono Nerd Font for the status-line and editor icons.
Install it for the current user:

```bash
mkdir -p ~/.local/share/fonts/JetBrainsMonoNerdFont
wget -O /tmp/JetBrainsMono.zip \
  https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip
unzip -o /tmp/JetBrainsMono.zip -d ~/.local/share/fonts/JetBrainsMonoNerdFont
fc-cache -f
```

## Deployment

Create the standard projects directory and deploy only the workstation-safe
packages:

```bash
mkdir -p ~/Developer/Projects
cd ~/Developer/dotfiles
stow -t ~ fedora kde zsh nvim tmux vim kitty gh
```

Keep an existing `~/.config/opencode` installation local. Do not deploy the
macOS-only `hammerspoon` or `orbstack` packages.

GitHub authentication is also machine-local. Stow manages `config.yml`, while
`gh auth login` creates the ignored `~/.config/gh/hosts.yml` credential file.

The Fedora package installs a user `.curlrc` that caps TLS at 1.2. This works
around TLS 1.3 EOF failures seen with Fedora Asahi's OpenSSL-backed curl and is
needed by the Tree-sitter installer. Remove the package with `stow -D fedora`
when the system curl no longer needs the workaround.

For KWin tiling, workspace, and launch-or-focus shortcuts, see
[`KDE.md`](KDE.md).

Initialize the shell, tmux, and Neovim plugins:

```bash
zsh -ilc exit
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
~/.tmux/plugins/tpm/bin/install_plugins
nvim --headless "+Lazy! sync" +qa
```

Set Zsh as the login shell, then sign out and back in:

```bash
chsh -s /usr/bin/zsh
```

## Verification

```bash
zsh -ilc 'echo $ZSH_VERSION'
tmux -L dotfiles-test -f ~/.tmux.conf new-session -d
tmux -L dotfiles-test kill-server
nvim --headless +qa
fc-match 'JetBrainsMono Nerd Font Mono'
```

Inside Neovim, run `:checkhealth`. Kitty and tmux use Wayland's existing
clipboard support; no macOS clipboard commands are loaded on Linux.
