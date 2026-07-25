# RevLogi's Dotfiles

A terminal-first, keyboard-driven macOS development environment — **Catppuccin-themed**, **Neovim-powered**, and **AI-enhanced** with seamless Tmux integration.

> **Fast Facts**

| Aspect | Choice |
|--------|--------|
| **Font** | JetBrains Mono Nerd Font |
| **Colorscheme** | Catppuccin (Mocha dark / Latte light) |
| **Shell** | Zsh + Zim (asciiship prompt) |
| **Editor** | Neovim (nightly via `bob`) + Vim (fallback) |
| **Multiplexer** | Tmux (prefix: `C-f`) |
| **Terminal** | Kitty |
| **Dotfile Manager** | GNU Stow |
| **AI Tools** | OpenCode + Hammerspoon LLM refinement |

## Design Philosophy

- **Cohesive Aesthetics** — Catppuccin theme applied consistently across Kitty, Tmux, and Neovim; Nerd Font icons throughout.
- **Keyboard-Driven** — Vi-mode in Zsh, Tmux, and Neovim; arrow keys disabled in Vim; every action has a binding.
- **Composable** — Tools work as a stack: Kitty hosts Tmux, Tmux hosts Zsh, Zsh launches Neovim; `vim-tmux-navigator` makes pane/window traversal seamless.
- **Minimal, Not Sparse** — Configure only what you use daily. No unused language servers, no bloated plugin lists. Every package in the Brewfile earns its place.

## Key Components

| Component | Role | Highlights |
|-----------|------|------------|
| **Zsh** | Shell | Zim framework with asciiship prompt, autosuggestions, syntax highlighting, fzf-tab completion; vi-mode with cursor shape change; aliases for quick navigation (`c`→Projects, `d`→Developer) |
| **Neovim** | Primary editor | kickstart.nvim foundation; blink.cmp for Tab-based completion; LSP for C/C++/Lua/Swift/Python/TypeScript/JSON/Vim/Zig; DAP debugging; treesitter; gitsigns; Oil.nvim; LeetCode integration; Conform formatting (stylua/clang-format/swiftformat/zigfmt) |
| **Tmux** | Terminal multiplexer | Catppuccin status bar with CPU/RAM/temperature monitoring via `smctemp`; smart-split (`C-f i` splits vertical/horizontal based on pane ratio); vi-mode copy; seamless Neovim navigation |
| **Kitty** | Terminal emulator | Auto theme switching (dark/light Catppuccin); remote control for image.nvim; powerline tab bar |
| **Hammerspoon** | macOS automation | Application launcher (Alt+key to focus apps); LLM-powered text refinement (GLM-4 / MiniMax) via Alt+R |
| **Karabiner-Elements** | Keyboard customization | Caps Lock as Escape/Control; Control+HJKL navigation; modifier and function-key remaps |
| **Vim** | Fallback editor | Minimal vim-plug setup with slime, surround, trailing-whitespace; hard mode (no arrow keys) |
| **OpenCode** | AI coding agent | Terminal-native AI pair programming |
| **OrbStack** | Docker / Linux VM | Lightweight container runtime for macOS |

## Keybindings

### Zsh

| Binding | Action |
|---------|--------|
| `c` | `cd ~/Developer/Projects` |
| `d` | `cd ~/Developer` |
| `y` | Launch Yazi file manager (cd on exit) |
| `s` | `fastfetch` system info |
| `o` | `opencode` |
| `t` | `tmux` |
| `nv` | `nvim` |

### Tmux *(prefix: `C-f`)*

| Binding | Action |
|---------|--------|
| `C-f i` | Smart split (auto-picks vertical or horizontal) |
| `C-f "` / `C-f %` | Split vertical / horizontal |
| `C-f c` | New window in `~` |
| `C-f s` | Session/window tree |
| `C-f K` | Clear scrollback |
| `C-f r` | Reload config |
| `S-Arrow` | Resize pane by 5 |
| `M-S-Left/Right` | Move window left/right |
| `C-h/j/k/l` | Navigate seamlessly between Tmux panes and Neovim splits |

### Neovim *(leader: `Space`)*

| Binding | Action |
|---------|--------|
| `-` | Oil.nvim parent directory (float) |
| `\` | Neo-tree reveal / close |
| `C-h/j/k/l` | Navigate splits (via vim-tmux-navigator) |
| `gy` | Change surrounding to `$()` (Lua) |
| **LSP** | |
| `<leader>k` | Hover documentation |
| `gra` | Code action |
| `grr` / `gri` / `grd` | References / Implementation / Definition |
| `gO` / `gW` | Document / Workspace symbols |
| `grn` | Rename |
| `<leader>q` | Diagnostic quickfix list |
| **Git** | |
| `<leader>hs` / `<leader>hr` | Stage / Reset hunk |
| `<leader>hS` / `<leader>hR` | Stage / Reset buffer |
| `<leader>hb` | Blame line |
| `<leader>hp` | Preview hunk |
| `<leader>hd` / `<leader>hD` | Diff against index / last commit |
| **Debug** | |
| `F5` | Start / Continue |
| `F1` / `F2` / `F3` | Step into / Over / Out |
| `<leader>b` | Toggle breakpoint |
| `F7` | Toggle DAP UI |
| **Other** | |
| `<leader>f` | Format buffer |

### Hammerspoon

| Binding | Action |
|---------|--------|
| `Alt+S` | Safari |
| `Alt+K` | Kitty |
| `Alt+O` | Obsidian |
| `Alt+W` | WeChat |
| `Alt+N` | Notes |
| `Alt+T` | Typora |
| `Alt+R` | Refine selected text via LLM |
| `Alt+1` / `Alt+2` | Refine with alternative LLM providers |

### Karabiner-Elements

| Binding | Action |
|---------|--------|
| `Caps Lock` | Escape when tapped, Left Control when held |
| `Left Control+H/J/K/L` | Left/Down/Up/Right arrow |
| `Right Command` | Left Option |
| `Right Option` | Fn |

## Installation

For Fedora Asahi Remix and other Fedora workstations, see
[`FEDORA.md`](FEDORA.md). It uses native Fedora packages and excludes the
macOS-only Hammerspoon and OrbStack packages.

For the KDE Plasma tiling and application-switching workflow, see
[`KDE.md`](KDE.md).

For the shared Ubuntu server workflow, see [`SERVER.md`](SERVER.md). The server
uses only the portable `zsh`, `nvim`, and `tmux` packages and installs all
machine-specific binaries and caches independently.

### Prerequisites

```bash
# Xcode Command Line Tools
xcode-select --install

# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Quick Start

```bash
# 1. Clone
git clone https://github.com/RevLogi/dotfiles.git ~/dotfiles && cd ~/dotfiles

# 2. Install all packages
brew bundle

# 3. Create symlinks with Stow
stow -t ~ zsh nvim opencode orbstack tmux vim kitty gh hammerspoon karabiner

# 4. Initialize plugins
source ~/.zshrc                                                   # Zim auto-installs
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm # TPM
~/.tmux/plugins/tpm/bin/install_plugins                           # Tmux plugins
nvim +Lazy\ sync +qa                                              # Neovim plugins
```

### Hammerspoon Setup

1. Copy the config template and set your API keys:

```bash
cp ~/dotfiles/hammerspoon/.hammerspoon/config.lua.example ~/.hammerspoon/config.lua
```

2. Create `~/.env` with your API keys:

```
GLM_API_KEY=your_glm_key_here
MINIMAX_API_KEY=your_minimax_key_here
```

3. Reload Hammerspoon (`Cmd+Shift+R`).

## Directory Structure

```
dotfiles/
 ├── zsh/              → ~/.zshrc, ~/.zimrc (Shell config)
 ├── nvim/             → ~/.config/nvim (Neovim config)
 ├── tmux/             → ~/.tmux.conf (Tmux config)
 ├── kitty/            → ~/.config/kitty (Terminal)
 ├── gh/               → ~/.config/gh (GitHub CLI)
 ├── vim/              → ~/.vimrc (Vim config)
 ├── opencode/         → ~/.config/opencode (AI coding)
 ├── orbstack/         → ~/.orbstack/ (Docker/Linux VM)
 ├── hammerspoon/      → ~/.hammerspoon/ (macOS automation)
 ├── karabiner/        → ~/.config/karabiner (Keyboard customization)
 ├── .vim/             → ~/.vim/ (Vim ftplugin + plugins)
 ├── Brewfile          (Homebrew packages)
 ├── .gitignore        (Excluded files)
 └── README.md         (This file)
```

Files are symlinked into `~` via Stow — edit them in their original locations or directly in `~`.

## Daily Usage

Changes to any dotfile propagate automatically through the Stow symlink:

```bash
vim ~/dotfiles/zsh/.zshrc && source ~/.zshrc
```

### Git Workflow

```bash
cd ~/dotfiles
git pull origin main
stow -R -t ~ zsh nvim opencode orbstack tmux vim kitty gh hammerspoon karabiner
source ~/.zshrc && tmux source-file ~/.tmux.conf
```

```bash
cd ~/dotfiles && git add . && git commit -m "Description of changes" && git push origin main
```

### Periodic Maintenance

**Weekly:**
```bash
brew update && brew upgrade && brew cleanup
nvim +Lazy\ sync +qa
```

**Monthly:**
```bash
~/.tmux/plugins/tpm/bin/update_plugins all
nvim +checkhealth +qa
git fetch -p && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -D
```
