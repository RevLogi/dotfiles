# Dotfiles Configuration

> Personal macOS dotfiles repository managed with GNU Stow and Git.

**Repository:** https://github.com/RevLogi/dotfiles

Complete macOS development environment: Zsh (Zim), Kitty, Neovim, Tmux, OrbStack, and modern CLI tools.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Directory Structure](#directory-structure)
- [Setup on New Mac](#setup-on-new-mac)
- [Key Components](#key-components)
- [Daily Usage](#daily-usage)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/RevLogi/dotfiles.git ~/dotfiles && cd ~/dotfiles

# 2. Install Homebrew packages
brew bundle

# 3. Create symlinks with Stow
stow -t ~ zsh nvim opencode orbstack tmux vim kitty

# 4. Initialize plugins
source ~/.zshrc                                        # Install Zim
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm  # Install TPM
~/.tmux/plugins/tpm/bin/install_plugins              # Install tmux plugins
nvim +Lazy sync +qa                                   # Install nvim plugins
```

---

## Directory Structure

```
dotfiles/
 ├── zsh/              → ~/.zshrc, ~/.zimrc (Shell config)
 ├── nvim/             → ~/.config/nvim (Neovim config)
 ├── tmux/             → ~/.tmux.conf (Tmux config)
 ├── kitty/            → ~/.config/kitty (Terminal)
 ├── vim/              → ~/.vimrc (Vim config)
 ├── opencode/         → ~/.config/opencode (AI coding)
 ├── orbstack/         → ~/.orbstack/ (Docker/Linux VM - manual sync)
 ├── .vim/             → ~/.vim/ (Vim plugins)
 ├── Brewfile          (Homebrew packages)
 ├── .gitignore        (Excluded files)
 └── README.md         (This file)
```

**Symlinks:** Edit files in `~` directly (changes propagate to dotfiles).

---

## Setup on New Mac

### Prerequisites

```bash
# Xcode Command Line Tools
xcode-select --install

# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Installation Steps

1. **Clone repository:** `git clone https://github.com/RevLogi/dotfiles.git ~/dotfiles`
2. **Install packages:** `cd ~/dotfiles && brew bundle`
3. **Create symlinks:** `stow -t ~ zsh nvim opencode orbstack tmux vim kitty`
4. **Install Zim:** `source ~/.zshrc` (auto-installs on first load)
5. **Install TPM:** `git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm`
6. **Install tmux plugins:** `~/.tmux/plugins/tpm/bin/install_plugins`
7. **Install Neovim plugins:** `nvim +Lazy sync +qa`

### Verification

```bash
# Test tools
which zsh nvim tmux kitty docker orb
nvim --version && tmux -V
which fzf fd ripgrep bat eza

# Verify fonts
fc-list | grep -i "jetbrains\|fira\|nerd"
```

---

## Key Components

### Zsh & Zim Framework

**Location:** `zsh/.zshrc`, `zsh/.zimrc`

**Features:**
- Vi mode, autosuggestions, syntax highlighting, history search (Ctrl+R)
- Asciiship minimal prompt
- Zim modules: environment, git, utility, completions, asciiship

**Custom Aliases:**
```bash
icloud → ~/iCloud/code    # Navigate to iCloud code
code   → ~/iCloud/code    # Alternative
dl     → ~/Downloads       # Downloads
c      → ~/Downloads/code  # Code in Downloads
o      → opencode          # AI coding
v      → vim               # Vim editor
nv     → nvim              # Neovim
t      → tmux              # Tmux
s      → fastfetch         # System info
sz     → source ~/.zshrc   # Reload shell
```

### Neovim

**Location:** `nvim/.config/nvim/`

**Based on:** kickstart.nvim (modular, Lua)

**Plugin Manager:** lazy.nvim

**Key Features:**
- LSP: lua_ls, ts_ls, jsonls, pyright, vimls, clangd
- Fuzzy finding: Telescope
- Completion: Blink.cmp
- Git: Gitsigns
- File explorer: Neo-tree
- Formatting: Conform.nvim (stylua, clang-format)
- Debugging: nvim-dap
- LeetCode integration

**Key Mappings:**
- `<space>` - Leader key
- `<Ctrl-h/j/k/l>` - Navigate windows
- `<space>f[f|g|b|h]` - Find files/grep/buffers/help
- `<leader>e` - Floating diagnostics
- `<leader>k` - Hover documentation

**Managing Plugins:** `:Lazy` (sync, clean, update)

### Tmux

**Location:** `tmux/.tmux.conf`

**Prefix:** `Ctrl-f` (instead of Ctrl-b)

**Plugin Manager:** TPM (`~/.tmux/plugins/tpm`)

**Plugins:**
- tmux-yank (clipboard)
- vim-tmux-navigator (seamless Vim/Tmux nav)
- tmux-cpu (status bar CPU/RAM)

**Key Bindings:**
```
Ctrl-f h/j/k/l       Navigate panes
Ctrl-f " / %          Split horizontal/vertical
Ctrl-f c              New window
Ctrl-f w              Choose window
Ctrl-f r              Reload config
Shift + Arrows        Resize panes
```

**Managing Plugins:**
```bash
~/.tmux/plugins/tpm/bin/install_plugins
~/.tmux/plugins/tpm/bin/update_plugins all
```

### Kitty

**Location:** `kitty/.config/kitty/`

**Theme:** Catppuccin-Frappe (auto-switches with macOS)

**Font:** JetBrainsMono Nerd Font Mono, size 16

**Features:**
- Tab bar, titlebar-only decorations
- Remote control (for image.nvim)

### OpenCode

**Location:** `opencode/.config/opencode/`

**Purpose:** AI coding assistant

**Features:**
- Auto-adapts to terminal theme
- Formatters: stylua, clang-format, markdownlint
- Ignores: node_modules, dist, .git

**Usage:** `opencode` or alias `o`

### OrbStack

**Location:** `orbstack/.orbstack/` (manually synced)

**Purpose:** Docker & Linux VM for macOS

**Features:**
- Native Docker/Compose support
- Lightweight Linux VM with SSH
- Faster/lighter than Docker Desktop

**Binary Symlinks:** orb, orbctl, docker, docker-compose, kubectl

**Usage:**
```bash
orb                    # Start Linux shell
orbctl list/start/stop # Control VM
docker ps              # Docker commands
orbctl ssh             # SSH into VM
```

**Manual Sync:** Copy `vmconfig.json` and `config/docker.json` to dotfiles before committing.

### Vim

**Location:** `vim/.vimrc`

**Purpose:** Minimal Vim (secondary to Neovim)

**Features:** Line numbers, 80-char column, vim-slime, trailing whitespace highlighting, hard mode (no arrows)

**Plugins:** vim-slime, vim-surround, vim-trailing-whitespace

### Homebrew

**File:** `Brewfile`

**Packages:** 27 formulas, 5 casks, 2 taps

**Categories:**
- Core: git, gcc, make, cmake
- Shell: tmux, kitty, orbstack
- Utilities: fzf, ripgrep, fd, yazi, fastfetch, bat, eza, zoxide
- Editors: bob (neovim), emacs-app
- Dev: node, pnpm, gh, openjdk
- AI: opencode
- Fonts: JetBrains Mono, Fira Code, Nerd Fonts

**Usage:**
```bash
brew bundle              # Install all
brew bundle check        # Check installed
brew bundle install      # Install missing
```

---

## Daily Usage

### Editing Configurations

Edit files in `~` directly (they're symlinks):
```bash
vim ~/.zshrc            # Changes propagate to ~/dotfiles/zsh/.zshrc
```

Or edit in dotfiles directory:
```bash
vim ~/dotfiles/zsh/.zshrc
source ~/.zshrc          # Test changes
```

### Stowing/Unstowing

```bash
# Add new package
mkdir ~/dotfiles/newapp && cd ~/dotfiles/newapp
echo "config" > .newapprc
cd ~/dotfiles && stow -t ~ newapp

# Update existing package
stow -R -t ~ nvim

# Remove package
stow -D -t ~ unwantedapp && rm -rf unwantedapp
```

### Git Workflow

**Sync from remote:**
```bash
cd ~/dotfiles
git pull origin main
stow -R -t ~ zsh nvim opencode orbstack tmux vim kitty
source ~/.zshrc && tmux source-file ~/.tmux.conf
```

**Commit and push:**
```bash
cd ~/dotfiles
git status && git diff
git add .
git commit -m "Description of changes"
git push origin main
```

**Commit style:**
```
feat: add new tool
fix: resolve bug
refactor: simplify config
docs: update README
```

### Periodic Maintenance

**Weekly:**
```bash
brew update && brew upgrade && brew cleanup
nvim +Lazy sync +qa
```

**Monthly:**
```bash
~/.tmux/plugins/tpm/bin/update_plugins all
nvim +checkhealth +qa
git fetch -p && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -D
brew cleanup --prune=30
```

---

## Troubleshooting

### Stow Issues

**"stow: command not found"** → `brew install stow`

**"target is not a directory"** → `mkdir -p ~/.config`

**Conflicts with existing files** → Backup and remove, then restow

### Neovim Issues

**Plugins not loading** → `:Lazy sync`

**LSP servers not working** → `:Mason` to install/check

**Tree-sitter issues** → `:TSUpdate`

**Health check** → `:checkhealth`

### Tmux Issues

**TPM missing** → `git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm`

**Plugins not loaded** → `~/.tmux/plugins/tpm/bin/install_plugins` and `tmux source-file ~/.tmux.conf`

**CPU/RAM not showing** → Check tmux-cpu: `ls ~/.tmux/plugins/tmux-cpu/`

### Zsh/Zim Issues

**Zim not loading** → `source ~/.zimfw.zsh init`

**Asciiship not working** → Check `ls ~/.zim/modules/asciiship` and verify in `.zimrc`

**Autosuggestions broken** → `rm ~/.zcompdump* && exec zsh`

### Homebrew Issues

**Package install failed** → `brew update && brew doctor`

**Outdated packages** → `brew upgrade && brew cleanup`

### Git Issues

**Permission denied pushing** → `git remote set-url origin git@github.com:RevLogi/dotfiles.git`

**Merge conflicts** → Resolve in editor, `git add <files>`, `git commit`

### Font Issues

**Icons not showing** → Verify: `brew list --cask | grep font`, reinstall via `brew bundle`

**Fonts wrong** → `fc-cache -fv` and restart terminal

---

## Additional Resources

- **Neovim:** `:help` or https://neovim.io/doc/
- **Tmux:** `man tmux` or https://github.com/tmux/tmux/wiki
- **Zsh/Zim:** https://github.com/zimfw/zimfw
- **Kitty:** https://sw.kovidgoyal.net/kitty/
- **Stow:** https://www.gnu.org/software/stow/
- **Homebrew:** https://docs.brew.sh/

---

## License

Personal dotfiles repository. Use as inspiration for your own setup.

---

## Contributing

Suggestions welcome! Fork, create feature branch, test thoroughly, submit PR.

---

**Last Updated:** January 14, 2026
**Maintainer:** @RevLogi
**Repository:** https://github.com/RevLogi/dotfiles
