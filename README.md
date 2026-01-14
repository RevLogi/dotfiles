# Dotfiles Configuration

> A personal dotfiles repository for macOS, managed with GNU Stow and Git.

**Repository:** https://github.com/RevLogi/dotfiles

This repository contains my complete macOS development environment configuration, including shell, terminal, editor, and application settings.

---

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Prerequisites](#prerequisites)
- [Initial Setup on New Mac](#initial-setup-on-new-mac)
- [Managing Configurations](#managing-configurations)
- [Syncing Between Macs](#syncing-between-macs)
- [Key Components Documentation](#key-components-documentation)
- [Custom Functions and Aliases](#custom-functions-and-aliases)
- [Troubleshooting](#troubleshooting)
- [File Backups and Version Control](#file-backups-and-version-control)
- [Recommended Workflow](#recommended-workflow)

---

## Overview

This dotfiles repository provides a reproducible macOS development environment with:

- **Shell**: Zsh with Zim Framework, Asciiship prompt, and vi-mode
- **Terminal**: Kitty GPU-accelerated terminal with Catppuccin theme
- **Editors**: Neovim (primary) with kickstart configuration, Vim (minimal)
- **Terminal Multiplexer**: Tmux with plugins (CPU monitor, yank, navigator)
- **Package Management**: Homebrew with Brewfile for reproducible installs
- **Tools**: Fuzzy finder, ripgrep, fd, yazi, and other modern CLI utilities

All configurations are symlinked to their appropriate locations using GNU Stow, allowing you to edit files directly in your home directory.

---

## Directory Structure

```
dotfiles/
 ├── .vim/                      → ~/.vim (Vim plugins directory)
 │   └── after/
 │       └── ftplugin/          (Language-specific Vim configs)
 ├── kitty/                     → ~/.config/kitty (Terminal emulator)
 │   └── .config/
 │       └── kitty/
 │           ├── kitty.conf     (Main configuration)
 │           ├── current-theme.conf
 │           ├── dark-theme.auto.conf
 │           └── light-theme.auto.conf
  ├── nvim/                      → ~/.config/nvim (Neovim config)
  │   └── .config/
  │       └── nvim/
  │           ├── init.lua        (Main config file)
  │           ├── lua/
  │           │   ├── custom/
  │           │   │   └── plugins/ (User plugins)
  │           │   └── lsp/        (LSP configurations)
  │           ├── AGENTS.md       (Code style guidelines)
  │           └── README.md       (Neovim-specific docs)
 ├── opencode/                  → ~/.config/opencode (OpenCode AI coding agent)
 │   └── .config/
 │       └── opencode/
 │           └── opencode.json  (OpenCode configuration)
 ├── orbstack/                  → ~/.orbstack (OrbStack configuration - manual sync)
 │   └── .orbstack/
 │       ├── vmconfig.json      (VM configuration)
 │       ├── vmstate.json      (VM state - excluded from git)
 │       ├── config/           (Additional configs)
 │       └── bin/               (Binary symlinks)
 ├── tmux/                      → ~/.tmux.conf (Tmux config)
 │   └── .tmux.conf
 ├── vim/                       → ~/.vimrc (Vim config)
 │   └── .vimrc
 ├── zsh/                       → ~/.zshrc, ~/.zimrc (Shell config)
 │   ├── .zshrc
 │   ├── .zimrc
 │   └── .zshrc-e
 ├── Brewfile                   (Homebrew packages and casks)
 ├── .gitignore                 (Files to exclude from git)
 └── README.md                  (This manual)
 ```

### Symlink Structure

GNU Stow creates symbolic links from the dotfiles repository to your home directory:

```
  ~/.zshrc          → ~/dotfiles/zsh/.zshrc
  ~/.zimrc          → ~/dotfiles/zsh/.zimrc
  ~/.tmux.conf      → ~/dotfiles/tmux/.tmux.conf
  ~/.vimrc          → ~/dotfiles/vim/.vimrc
  ~/.vim/           → ~/dotfiles/.vim/
  ~/.orbstack/      → ~/dotfiles/orbstack/.orbstack/ (manual sync)
  ~/.config/kitty/  → ~/dotfiles/kitty/.config/kitty/
  ~/.config/nvim/   → ~/dotfiles/nvim/.config/nvim/
  ~/.config/opencode/ → ~/dotfiles/opencode/.config/opencode/
 ```

This means you can:
- Edit files in `~` directly (they're symlinks, changes propagate)
- Edit files in `~/dotfiles` directly
- Version control everything in one place

---

## Prerequisites

Before setting up this dotfiles repository, ensure you have:

 - **macOS** operating system (tested on latest versions)
 - **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```
 - **Homebrew** package manager
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
 - **Git** version control (installed with Xcode tools or via Homebrew)
 - **GNU Stow** (installed via Homebrew in Brewfile)
 - **OpenCode** (optional, for AI coding assistance - installed via Homebrew in Brewfile)

---

## Initial Setup on New Mac

Follow these steps to set up the complete development environment on a new Mac.

### Step 1: Install Prerequisites

```bash
# Install Xcode Command Line Tools (if not already installed)
xcode-select --install

# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (Apple Silicon Macs)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 2: Clone This Repository

```bash
# Clone the repository to your home directory
git clone https://github.com/RevLogi/dotfiles.git ~/dotfiles

# Navigate to the dotfiles directory
cd ~/dotfiles
```

### Step 3: Create Symlinks with Stow

GNU Stow creates symlinks to the appropriate locations in your home directory.

```bash
# Stow all packages to create symlinks
stow -t ~ zsh nvim opencode orbstack tmux vim kitty

# Verify symlinks were created
ls -la ~ | grep -E "(zshrc|tmux.conf|vimrc|orbstack)"
ls -la ~/.config | grep -E "(nvim|kitty|opencode)"
```

### Step 4: Install Homebrew Packages

```bash
# Install all packages defined in Brewfile
brew bundle

# This will install:
# - 27 brew formulas (CLI tools, languages, libraries, OpenCode)
# - 6 brew casks (applications, fonts)
```

### Step 5: Install Zim Framework (Shell Plugins)

Zim is a Zsh configuration framework with modules and plugins.

```bash
# Open a new terminal window or run:
source ~/.zshrc

# Zim will automatically:
# - Download zimfw plugin manager
# - Install missing modules
# - Initialize modules
```

### Step 6: Install Tmux Plugin Manager (TPM) and Plugins

First, clone TPM (Tmux Plugin Manager) manually:

```bash
# Clone TPM to the correct location
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

Then install all configured plugins:

```bash
# Install Tmux Plugin Manager and plugins
~/.tmux/plugins/tpm/bin/install_plugins

# Then reload tmux configuration
tmux source-file ~/.tmux.conf
```

**Note:** TPM is not available via Homebrew and must be cloned via git. Your `tmux.conf` will automatically initialize TPM when loaded.

### Step 7: Install Neovim Plugins and Tools

```bash
# Open Neovim
nvim

# Inside Neovim, run:
:Lazy sync    # Install/update plugins
:checkhealth  # Check for any issues
```

The first time you open Neovim:
1. Mason will install language servers (lua_ls, pyright, clangd, etc.)
2. Lazy will download all plugins
3. Tree-sitter parsers will be installed for syntax highlighting

### Step 8: Verify Everything Works

```bash
# Test shell
which zsh
echo $SHELL

# Test neovim
nvim --version

# Test tmux
tmux -V

# Test kitty (if you're using it)
kitty --version

# Test common tools
which fzf fd ripgrep bat eza
```

### Step 9: Optional Personalization

```bash
# Install fonts (already done via Brewfile, but verify)
fc-list | grep -i "jetbrains"
fc-list | grep -i "fira"
fc-list | grep -i "nerd"

# Prompt is handled by asciiship (Zim module)
# Asciiship is automatically loaded by Zim Framework
```

---

## Managing Configurations

### Adding a New Application Configuration

To add configuration for a new application:

```bash
# 1. Create a directory for the application
mkdir ~/dotfiles/newapp/

# 2. Add configuration files (with dot prefix)
cd ~/dotfiles/newapp/
echo "configuration" > .newapprc

# 3. Create the stow symlink
cd ~/dotfiles
stow -t ~ newapp

# 4. Verify the symlink was created
ls -la ~/.newapprc

# 5. Commit and push changes
git add .
git commit -m "Add newapp configuration"
git push origin main
```

### Updating Existing Configurations

You can edit configuration files in two ways:

**Method 1: Edit in home directory (recommended)**
```bash
# Edit directly - changes automatically propagate
vim ~/.zshrc
```

**Method 2: Edit in dotfiles directory**
```bash
# Edit in the repository
vim ~/dotfiles/zsh/.zshrc

# Test changes
source ~/.zshrc
```

### Managing Symlinks with Stow

```bash
# Stow a new package
stow -t ~ <package_name>

# Unstow (remove symlinks for a package)
stow -D -t ~ <package_name>

# Restow (update symlinks after structure changes)
stow -R -t ~ <package_name>

# Simulate stowing without making changes
stow -n -t ~ <package_name>
```

**Example:** After adding a new plugin to nvim configuration:
```bash
cd ~/dotfiles
stow -R -t ~ nvim
```

### Removing a Package

```bash
# 1. Unstow the package
cd ~/dotfiles
stow -D -t ~ unwantedapp

# 2. Remove the package directory
rm -rf unwantedapp/

# 3. Commit and push
git add -A
git commit -m "Remove unwantedapp configuration"
git push origin main
```

---

## Syncing Between Macs

### Pulling Changes (Updating Current Machine)

When you've made changes on another Mac and want to sync:

```bash
cd ~/dotfiles

# Pull latest changes
git pull origin main

# Restow packages to update any structure changes
stow -R -t ~ zsh nvim opencode tmux vim kitty

# Reload shell configuration
source ~/.zshrc

# Reload tmux configuration (if running tmux)
tmux source-file ~/.tmux.conf

# Update Neovim plugins
nvim +Lazy sync +qa
```

### Pushing Changes (Uploading Current State)

After making changes to your configuration:

```bash
cd ~/dotfiles

# Check what has changed
git status

# Review changes
git diff

# Add changed files
git add .
# Or add specific files:
# git add zsh/.zshrc nvim/.config/nvim/init.lua

# Commit with descriptive message
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

### Periodic Maintenance

**Daily/Weekly:**
```bash
# Update Homebrew
brew update
brew upgrade
brew cleanup

# Update Neovim plugins
nvim +Lazy sync +qa
```

**Monthly:**
```bash
# Update Tmux plugins
~/.tmux/plugins/tpm/bin/update_plugins all

# Check for issues
nvim +checkhealth +qa

# Clean up git branches
cd ~/dotfiles
git fetch -p && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -D
```

### Handling Merge Conflicts

If you have changes on multiple machines and get merge conflicts:

```bash
cd ~/dotfiles

# Pull changes
git pull origin main

# If conflicts occur, Git will show you which files have conflicts

# Open conflicting files and resolve conflicts
vim zsh/.zshrc
# Look for <<<<<<<, =======, >>>>>>> markers
# Edit to resolve, remove markers

# Stage resolved files
git add <resolved-files>

# Complete merge
git commit

# Push
git push origin main
```

---

## Key Components Documentation

### Zsh & Zim Framework

**Location:** `zsh/.zshrc`, `zsh/.zimrc`

**Zim Modules** (configured in `.zimrc`):
- `environment` - Sane Zsh built-in options
- `git` - Handy git aliases and functions
- `input` - Correct bindkeys for input events
- `termtitle` - Custom terminal title
- `utility` - Utility aliases and functions
- `duration-info` - Command duration in prompt
- `git-info` - Git repository status in prompt
- `asciiship` - Minimal prompt theme
- `zsh-users/zsh-completions` - Additional completions
- `zsh-users/zsh-syntax-highlighting` - Syntax highlighting
- `zsh-users/zsh-history-substring-search` - History search
- `zsh-users/zsh-autosuggestions` - Autosuggestions

**Key Features:**
- Vi mode (`bindkey -v`)
- Autosuggestions
- Syntax highlighting
- History substring search (Ctrl+R)
- Asciiship prompt (minimal, ASCII-only prompt)

**Shell Environment:**
- Neovim managed by bob: `export PATH="$HOME/.local/share/bob/nvim-bin:$PATH"`
- Cursor changes based on vi mode (block in normal, beam in insert)
- History ignores duplicates

**Custom Aliases:**
```bash
icloud    → cd ~/Library/Mobile Documents/com~apple~CloudDocs/
code      → cd ~/Library/Mobile Documents/com~apple~CloudDocs/code
home      → cd ~
dl        → cd ~/Downloads
c         → cd ~/Downloads/code
o         → opencode
s         → fastfetch
v         → vim
sz        → source ~/.zshrc
nv        → nvim
t         → tmux
```

### Neovim

**Location:** `nvim/.config/nvim/`

**Based on:** kickstart.nvim (modular version)

**Plugin Manager:** lazy.nvim

**Key Features:**
- LSP support with Mason (language servers, formatters, linters)
- Telescope (fuzzy finder for files, buffers, grep, etc.)
- Blink.cmp (modern completion engine)
- Gitsigns (git integration in gutter)
- Tree-sitter (syntax highlighting)
- Neo-tree (file explorer)
- Conform.nvim (formatting)
- nvim-lint (linting)
- Todo-comments (TODO highlighting)
- Leetcode.nvim (LeetCode integration)
- Debugging support (nvim-dap)

**Configured Language Servers:**
- `lua_ls` - Lua
- `ts_ls` - TypeScript/JavaScript
- `jsonls` - JSON
- `pyright` - Python
- `vimls` - Vim script
- `clangd` - C/C++

**Formatters:**
- `stylua` - Lua
- `clang-format` - C/C++

**Linters:**
- `markdownlint` - Markdown

**Key Mappings:**
- `<space>` - Leader key
- `<Ctrl-h/j/k/l>` - Navigate windows
- `<space>ff` - Find files
- `<space>fg` - Live grep
- `<space>fb` - Buffers
- `<space>fh` - Help tags
- `<space>f` - Format buffer

**Plugin Locations:**
- Main config: `init.lua`
- Custom plugins: `lua/custom/plugins/`
- LSP configs: `lua/lsp/`

**Documentation:**
- See `nvim/.config/nvim/README.md` for Neovim-specific setup
- See `nvim/.config/nvim/AGENTS.md` for code style guidelines

**Managing Plugins:**
```bash
# Inside Neovim
:Lazy              # Open plugin manager
:Lazy sync         # Sync all plugins
:Lazy clean        # Clean unused plugins
:checkhealth       # Check Neovim health
```

### Tmux

**Location:** `tmux/.tmux.conf`

**Prefix Key:** `Ctrl-f` (instead of default Ctrl-b)

**Plugin Manager:** TPM (Tmux Plugin Manager)

**Installed Plugins:**
- `tmux-plugins/tpm` - Plugin manager
- `tmux-plugins/tmux-sensible` - Sensible defaults
- `tmux-plugins/tmux-yank` - Copy to system clipboard
- `christoomey/vim-tmux-navigator` - Seamless navigation between Vim and Tmux panes
- `tmux-plugins/tmux-cpu` - CPU/memory usage in status bar

**Key Features:**
- Vi mode for copy mode
- Mouse support enabled
- Status bar with CPU, RAM, temperature, hostname
- Catppuccin-Frappe color scheme
- Smart split (vertical/horizontal based on pane size)

**Key Bindings:**
```
Prefix key: Ctrl-f

Navigation:
  Ctrl-f h/j/k/l     Navigate panes
  h/j/k/l             Navigate panes (in vi mode)
  Ctrl-f Ctrl-h/j/k/l Navigate Vim/Tmux seamlessly

Splits:
  Ctrl-f "            Horizontal split
  Ctrl-f %            Vertical split
  Ctrl-f i            Smart split (auto choose orientation)

Windows:
  Ctrl-f c            New window
  Ctrl-f w            Choose window tree
  Ctrl-f s            Choose session tree

Resize:
  Shift + Arrows      Resize panes
  Alt + Shift + Left/Right  Move windows

Copy Mode (vi style):
  v                   Begin selection
  Ctrl-v              Rectangle selection
  y                   Copy selection
  Y                   Copy to end of line

Other:
  Ctrl-f r            Reload config
  Ctrl-f K            Clear scrollback
  Ctrl-f b            Go to last prompt
```

**Managing Plugins:**
```bash
# Install plugins
~/.tmux/plugins/tpm/bin/install_plugins

# Update plugins
~/.tmux/plugins/tpm/bin/update_plugins all

# Clean unused plugins
~/.tmux/plugins/tpm/bin/clean_plugins
```

**Status Bar:**
- Left: Session name, truncated path
- Right: CPU %, RAM %, Temperature, Hostname
- Updates every 5 seconds

### Kitty

**Location:** `kitty/.config/kitty/`

**Theme:** Catppuccin-Frappe (auto-switching based on macOS theme)

**Font:** JetBrainsMono Nerd Font Mono, size 16

**Key Features:**
- Tab bar at top with powerline style
- Hide window decorations (titlebar only)
- Disable ligatures for cursor
- Remote control enabled for image.nvim

**Configuration Files:**
- `kitty.conf` - Main configuration
- `current-theme.conf` - Current theme symlink
- `dark-theme.auto.conf` - Dark theme configuration
- `light-theme.auto.conf` - Light theme configuration

### OpenCode

**Location:** `opencode/.config/opencode/`

**Purpose:** AI coding agent configuration

**Key Features:**
- **System theme**: Automatically adapts to terminal colors for seamless integration
- **TUI settings**: macOS-style scroll acceleration, auto diff style
- **Formatters**: Configured for Lua (stylua), C/C++ (clang-format), Markdown (markdownlint)
- **File watcher**: Ignores build directories (node_modules, dist, .git, etc.)
- **Context compaction**: Automatically compacts when context is full

**Theme Behavior:**
- Uses `system` theme that auto-adapts to terminal colors
- Matches your Kitty's automatic theme switching (dark/light)
- Generates grayscale based on terminal background
- Uses ANSI colors for syntax highlighting

**Configuration Options:**
- **Theme**: "system" (auto-adapts)
- **Autoupdate**: "notify" (notifies but doesn't auto-install)
- **Formatters**: Stylua, clang-format, markdownlint
- **Watcher ignore**: node_modules, dist, .git, build, .next

**Usage:**
```bash
# Start OpenCode TUI
opencode

# Or use the alias
o
```

**Installation:**
```bash
# Install via Homebrew (included in Brewfile)
brew install anomalyco/tap/opencode
```

**Configuration:**
Edit `~/.config/opencode/opencode.json` to customize behavior.

### OrbStack

**Location:** `~/.orbstack/` (manually synced, not managed by Stow)

**Purpose:** Docker containerization and Linux VM runtime for macOS

**Key Features:**
- **Docker integration**: Native Docker and Docker Compose support
- **Linux VM**: Full Linux environment with SSH access
- **Performance**: Faster and lighter than Docker Desktop
- **Resource efficient**: Minimal CPU and memory overhead

**Binary Symlinks:**
- `/usr/local/bin/orb` - OrbStack control command
- `/usr/local/bin/orbctl` - OrbStack control CLI
- `/usr/local/bin/docker` - Docker CLI
- `/usr/local/bin/docker-compose` - Docker Compose CLI
- `/usr/local/bin/kubectl` - Kubernetes CLI

**Usage Examples:**
```bash
# Start a Linux shell
orb

# Run commands in Linux
orb uname -a

# Control OrbStack machines
orbctl list          # List machines
orbctl start         # Start OrbStack
orbctl stop          # Stop OrbStack

# Docker operations
docker ps
docker build -t myapp .
docker run -it myapp

# SSH into Linux VM
orbctl ssh
```

**Configuration:**
- `~/.orbstack/vmconfig.json` - VM settings (CPU, memory, disk)
- `~/.orbstack/config/docker.json` - Docker-specific settings
- Configuration is manually synced (not in stow)

**Note:**
OrbStack configs are tracked separately and synced manually to avoid version control issues with transient state files (vmstate.json, logs, etc.). Only edit vmconfig.json when needed for system resources.

### Vim

**Location:** `vim/.vimrc`

**Purpose:** Minimal Vim configuration for occasional use (primary editor is Neovim)

**Key Features:**
- Line numbers (hybrid: relative + absolute)
- Color column at 80 characters
- Hard mode (arrow keys disabled)
- Auto-save on text changes
- Vim-slime for code execution in tmux
- Trailing whitespace highlighting
- Surround plugin
- Mouse support enabled

**Plugins (Vim-Plug):**
- `bronson/vim-trailing-whitespace` - Clean whitespace
- `jpalardy/vim-slime` - Code execution in tmux
- `tpope/vim-surround` - Surround text objects

**Removed from original:**
- LSP functionality (coc.nvim)
- File manager (vim-fern)
- Theme (solarized8)
- Haskell-specific syntax highlighting

### Homebrew

**File:** `Brewfile`

**Package Summary:**
- 27 brew formulas
- 5 brew casks
- 2 taps (narugit/tap, anomalyco/tap)

**Categories:**
1. Taps (narugit/tap, anomalyco/tap)
2. Core Development Tools (git, gcc, make, cmake)
3. Terminal & Shell (tmux, kitty, orbstack)
4. Terminal Utilities (fzf, ripgrep, fd, tree, zoxide, yazi, fastfetch, ncdu, stow, htop, btop, jq, wget, mole, bat, eza)
5. Editors & Tools (bob, emacs-app)
6. GitHub & Version Control (gh)
7. Package Managers (node, pnpm)
8. Languages (openjdk)
9. Development Libraries (imagemagick, ffmpeg, tesseract)
10. AI & Development Assistants (opencode)
11. Fonts (JetBrains Mono, Fira Code, Symbols Only - Nerd Fonts)

**Usage:**
```bash
# Install all packages
brew bundle

# Check what's installed
brew bundle check

# Update and upgrade
brew bundle install --cleanup
```

**Note on Tmux Plugins:**
- TPM (Tmux Plugin Manager) is not available via Homebrew
- Install via git: `git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm`
- Then install plugins: `~/.tmux/plugins/tpm/bin/install_plugins`

---

## Custom Functions and Aliases

### Custom Functions

**yazi()** - Terminal file manager with directory persistence
```bash
function y() {
  local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
  yazi "$@" --cwd-file="$tmp"
  IFS= read -r -d '' cwd < "$tmp"
  [ -n "$cwd" ] && [ "$cwd" != "$PWD" ] && builtin cd -- "$cwd"
  rm -f -- "$tmp"
}
```

**gemini()** - Google Gemini CLI with auto theme switching
```bash
function gemini() {
  # Detect macOS System Theme
  local mode=$(defaults read -g AppleInterfaceStyle 2>/dev/null)

  # Select theme based on mode
  if [[ "$mode" == "Dark" ]]; then
    local theme="GitHub"
  else
    local theme="ANSI Light"
  fi

  # Update settings.json automatically
  sed -i '' 's/"theme": "[^"]*"/"theme": "'"$theme"'"/' ~/.gemini/settings.json

  # Launch Gemini CLI
  command gemini "$@"
}
```

### Custom Aliases

```bash
# Navigation
icloud     → cd ~/Library/Mobile Documents/com~apple~CloudDocs/
code       → cd ~/Library/Mobile Documents/com~apple~CloudDocs/code
home       → cd ~
dl         → cd ~/Downloads
c          → cd ~/Downloads/code

# Editors & Tools
o          → opencode
v          → vim
nv         → nvim
t          → tmux

# System
s          → fastfetch (system information)
sz         → source ~/.zshrc (reload shell)
```

---

## Troubleshooting

### Stow Not Working

**Problem:** `stow` command not found
```bash
# Solution: Install stow via Homebrew
brew install stow
```

**Problem:** "target is not a directory" error
```bash
# Solution: Create the target directory first
mkdir -p ~/.config
stow -t ~ <package>
```

**Problem:** Conflicts with existing files
```bash
# Solution: Remove or backup the conflicting file first
mv ~/.zshrc ~/.zshrc.backup
stow -t ~ zsh
```

### Neovim Issues

**Problem:** Plugins not loading
```bash
# Open Neovim and run:
:Lazy
# Check plugin status and sync if needed

# Check health:
:checkhealth
```

**Problem:** LSP servers not working
```bash
# Check Mason for installed servers
:Mason

# Ensure Mason is properly set up in LSP config
# File: nvim/.config/nvim/lua/custom/plugins/lspconfig.lua
```

**Problem:** Tree-sitter highlighting issues
```bash
# Update parsers inside Neovim
:TSUpdate
```

### Tmux Issues

**Problem:** TPM directory doesn't exist
```bash
# Solution: Clone TPM first
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

# Then install plugins
~/.tmux/plugins/tpm/bin/install_plugins

# Reload tmux
tmux source-file ~/.tmux.conf
```

**Problem:** Plugins not loaded
```bash
# Install plugins
~/.tmux/plugins/tpm/bin/install_plugins

# Reload config
tmux source-file ~/.tmux.conf
```

**Problem:** CPU/RAM status not showing
```bash
# Ensure tmux-cpu is installed
ls ~/.tmux/plugins/tmux-cpu/

# If missing, install it
git clone https://github.com/tmux-plugins/tmux-cpu.git ~/.tmux/plugins/tmux-cpu
```

**Problem:** Prefix key not working
```bash
# Check prefix is set to Ctrl-f
grep "prefix" ~/.tmux.conf

# Should see: set -g prefix C-f
```

### Zsh/Zim Issues

**Problem:** Zim modules not loading
```bash
# Reinstall zimfw
source ~/.zimfw.zsh init

# Check zimfw installation
ls ~/.zim/
```

**Problem:** Asciiship prompt not working
```bash
# Check if asciiship module is installed
ls ~/.zim/modules/asciiship

# Verify it's in .zimrc
grep "asciiship" ~/.zimrc
# Should see: zmodule asciiship

# Reinitialize zimfw
source ~/.zimfw.zsh init
```

**Problem:** Autosuggestions not working
```bash
# Check if autosuggestions module is installed
ls ~/.zim/modules/zsh-autosuggestions

# Rebuild completion
rm ~/.zcompdump*
exec zsh
```

### Font Issues

**Problem:** Nerd fonts not displaying icons
```bash
# Verify fonts are installed
brew list --cask | grep -i font

# Reinstall fonts from Brewfile
brew bundle

# Verify in Kitty config
grep "font_family" ~/.config/kitty/kitty.conf
```

**Problem:** Fonts looking wrong or not found
```bash
# Clear font cache
fc-cache -fv

# Restart terminal
```

### Homebrew Issues

**Problem:** Package installation failed
```bash
# Update Homebrew
brew update

# Fix any issues
brew doctor

# Try installing again
brew install <package>
```

**Problem:** Outdated packages
```bash
# Update all packages
brew upgrade

# Clean up old versions
brew cleanup
```

### Git Issues

**Problem:** Permission denied when pushing
```bash
# Check remote URL
git remote -v

# Update to use SSH (recommended)
git remote set-url origin git@github.com:RevLogi/dotfiles.git

# Or use HTTPS with personal access token
git remote set-url origin https://github.com/RevLogi/dotfiles.git
```

**Problem:** Merge conflicts
```bash
# Pull changes
git pull origin main

# Resolve conflicts in your editor
vim <conflicted-file>

# Stage resolved files
git add <resolved-files>

# Complete merge
git commit
```

---

## File Backups and Version Control

### .gitignore

The `.gitignore` file excludes:
- Editor swap files (.swp, .swo, .un~)
- Temporary files (*.tmp, .bak, .old)
- macOS system files (.DS_Store)
- Shell history (.zsh_history, .bash_history)
- Logs (*.log)
- Security files (.env, .secrets, *.key)
- Node modules and Python cache
- IDE configs (.vscode, .idea)
- Neovim specific files (LuaJIT, spell, undodir, swap)

### Commit Workflow

**Recommended practice:**

```bash
# 1. Make changes
# Edit files directly in ~ or ~/dotfiles

# 2. Test changes locally
# - For shell: source ~/.zshrc
# - For tmux: tmux source-file ~/.tmux.conf
# - For neovim: nvim +checkhealth

# 3. Check what changed
git status
git diff

# 4. Stage changes
git add <specific-files>
# Or add all:
git add .

# 5. Commit with descriptive message
git commit -m "Add new feature or fix bug"
```

**Commit message style:**
```
feat: add new neovim plugin
fix: resolve tmux status bar issue
refactor: simplify zsh prompt configuration
docs: update README with new instructions
style: format lua files with stylua
```

### Branching Strategy

**Main branch (default):**
- Contains stable, tested configurations
- Only push after testing on primary machine

**Feature branches (optional):**
```bash
# Create feature branch
git checkout -b feature/new-tool

# Make changes and commit
git add .
git commit -m "Add new tool configuration"

# Test on secondary machine
git push origin feature/new-tool
# On other machine: git checkout feature/new-tool

# Merge to main when ready
git checkout main
git merge feature/new-tool
git push origin main
```

### Backup Strategy

**Automatic:**
- Git repository serves as backup
- All config changes tracked in version history

**Manual (periodic):**
```bash
# Tag major versions
git tag -a v1.0 -m "Initial stable setup"
git push origin v1.0

# Create archive before major changes
git archive --format=tar.gz main -o dotfiles-backup-$(date +%Y%m%d).tar.gz
```

---

## Recommended Workflow

### Daily Workflow

```bash
# Start day: pull latest changes (if working on multiple machines)
cd ~/dotfiles && git pull origin main

# During day: make configuration changes as needed
# Edit files in ~ directly (they're symlinks)

# End day: commit and push if you made changes
cd ~/dotfiles
git add .
git commit -m "Description of today's changes"
git push origin main
```

### Weekly Maintenance

```bash
# 1. Update Homebrew
brew update && brew upgrade && brew cleanup

# 2. Update Neovim plugins
nvim +Lazy sync +qa

# 3. Check git status
cd ~/dotfiles
git status
git pull origin main

# 4. Test configurations
# - Open neovim and run :checkhealth
# - Test tmux prefix key and plugins
# - Verify shell aliases work
# - Check kitty theme switching

# 5. Cleanup if needed
brew cleanup
git gc --aggressive --prune=now
```

### Monthly Deep Clean

```bash
# 1. Update Tmux plugins
~/.tmux/plugins/tpm/bin/update_plugins all

# 2. Check Neovim health
nvim +checkhealth +qa

# 3. Clean up git branches
cd ~/dotfiles
git fetch -p
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -D 2>/dev/null || true

# 4. Review and clean Homebrew
brew cleanup --prune=30

# 5. Check for security updates
brew outdated

# 6. Backup current state (optional)
git tag -a backup-$(date +%Y%m%d) -m "Monthly backup"
git push origin --tags

# 7. Review Brewfile
# - Remove unused packages
# - Add new tools you're using
brew bundle dump --force
```

### Before Major Changes

```bash
# 1. Create a backup branch
cd ~/dotfiles
git checkout -b backup-before-changes
git push origin backup-before-changes

# 2. Create a feature branch
git checkout main
git checkout -b feature/experiment

# 3. Make changes and test thoroughly
# Edit configs, test on primary machine

# 4. If working, merge to main
git checkout main
git merge feature/experiment
git push origin main

# 5. Delete feature branch
git branch -d feature/experiment
```

### Multiple Machine Workflow

**Primary Machine (your main dev machine):**
```bash
# Make changes
# Test thoroughly
# Commit and push
cd ~/dotfiles
git add .
git commit -m "Add new configuration"
git push origin main
```

**Secondary Machine (laptop, test machine):**
```bash
# Pull changes
cd ~/dotfiles
git pull origin main

# Restow packages (if structure changed)
stow -R -t ~ zsh nvim opencode tmux vim kitty

# Test on this machine
# - If issues: fix, commit, push
# - If working: good to go

# If you make changes here:
# Commit with context: "Update for laptop-specific setup"
# Or create a branch: git checkout -b laptop-tweaks
```

---

## Additional Resources

- **Neovim Documentation:** `:help` inside Neovim or https://neovim.io/doc/
- **Tmux Manual:** `man tmux` or https://github.com/tmux/tmux/wiki
- **Zsh Manual:** `man zsh` or https://zsh.sourceforge.io/Doc/
- **Zim Framework:** https://github.com/zimfw/zimfw
- **Asciiship Prompt:** https://github.com/zimfw/asciiship
- **Kitty Documentation:** https://sw.kovidgoyal.net/kitty/
- **Homebrew Documentation:** https://docs.brew.sh/
- **GNU Stow:** https://www.gnu.org/software/stow/

---

## License

This is a personal dotfiles repository. Feel free to use it as inspiration for your own configuration.

---

## Contributing

This is a personal repository, but suggestions and improvements are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## Changelog

### Major Updates

- **2025-01-12**: Added Brewfile for Homebrew package management
- **2025-01-11**: Cleaned vim configuration, removed LSP and unnecessary features
- Previous updates: See git commit history: `git log --oneline`

---

**Last Updated:** January 12, 2026

**Maintained by:** @RevLogi

**Repository:** https://github.com/RevLogi/dotfiles
