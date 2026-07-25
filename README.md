# Dotfiles

Cross-platform terminal and desktop configuration managed with GNU Stow.
Shared packages run on macOS, Fedora, and remote Linux servers; platform-only
packages are deployed selectively.

## Stack

| Component | Configuration |
|-----------|---------------|
| Shell | Zsh, Zim, vi mode, zoxide, and fzf |
| Editor | Neovim 0.11+, LSP, Tree-sitter, DAP, and Vim fallback |
| Terminal | Kitty with Catppuccin themes |
| Multiplexer | tmux with `C-f` prefix and Neovim navigation |
| Automation | Hammerspoon and Karabiner-Elements on macOS |
| Desktop | KDE helpers and Input Remapper on Fedora |
| Tooling | GitHub CLI and OpenCode |

## Packages

```text
zsh/             Shared shell configuration
nvim/            Shared Neovim configuration
tmux/            Shared tmux configuration and platform profiles
vim/             Minimal fallback editor
kitty/           Kitty terminal configuration
gh/              GitHub CLI configuration without credentials
opencode/        OpenCode configuration
hammerspoon/     macOS application shortcuts
karabiner/       macOS keyboard remapping
fedora/          Fedora Asahi curl workaround
kde/             KDE launch-or-focus helpers
input-remapper/  Fedora keyboard remapping
server/          Remote development environment manifest
docs/            Platform setup guides
```

## Deployment

Clone the repository, install GNU Stow, and deploy only the packages needed on
the current machine.

### macOS

```bash
brew bundle
stow -t ~ zsh nvim opencode tmux vim kitty gh hammerspoon karabiner
```

OrbStack is installed by the Brewfile but its generated state is not managed by
this repository.

### Fedora KDE

```bash
stow -t ~ fedora kde input-remapper zsh nvim tmux vim kitty gh
```

See [`docs/fedora.md`](docs/fedora.md) for installation, then
[`docs/kde.md`](docs/kde.md) and [`docs/keyboard.md`](docs/keyboard.md) for the
desktop workflow.

### Linux Server

```bash
stow -t ~ zsh nvim tmux
```

See [`docs/server.md`](docs/server.md) for user-local tools and remote resource
guidelines.

## Bootstrap

After deployment, initialize the managed tools:

```bash
zsh -ilc exit
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
~/.tmux/plugins/tpm/bin/install_plugins
nvim --headless "+Lazy! sync" +qa
```

Run machine-local authentication separately with `gh auth login`. The resulting
`hosts.yml`, API keys, plugin data, caches, and runtime state are ignored.

## Common Bindings

| Context | Binding | Action |
|---------|---------|--------|
| Zsh | `c` / `d` | Open `~/Developer/Projects` / `~/Developer` |
| Zsh | `o` / `t` / `nv` | OpenCode / tmux / Neovim |
| tmux | `C-f` | Prefix |
| tmux | `C-f i` | Smart pane split |
| tmux/Neovim | `C-h/j/k/l` | Navigate panes and splits |
| KDE | `Alt+S` / `Alt+K` | Focus Firefox / Kitty |

Configuration files are symlinked into `$HOME`; edits through either path
update this repository.
