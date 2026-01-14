# =====================================================================
# BREWFILE - Homebrew Package Manager Configuration
# =====================================================================
#
# This file manages all Homebrew packages and casks for this dotfiles repo.
#
# Usage:
#   Install all packages:  brew bundle
#   Check for updates:     brew bundle check
#   Update packages:       brew bundle install --cleanup
#
# =====================================================================

# =====================================================================
# TAPS (Third-party repositories)
# =====================================================================
# Additional package repositories for specialized tools

tap "narugit/tap"            # smctemp for CPU temperature monitoring

# =====================================================================
# CORE DEVELOPMENT TOOLS
# =====================================================================
# Essential build tools and version control for development

brew "git"                    # Distributed version control system
brew "gcc"                    # GNU compiler collection
brew "make"                   # Build automation tool
brew "cmake"                  # Cross-platform build system generator

# =====================================================================
# TERMINAL & SHELL
# =====================================================================
# Terminal emulator and shell configuration

brew "tmux"                   # Terminal multiplexer
cask "kitty"                  # GPU-accelerated terminal emulator
cask "orbstack"               # Docker & Linux VM runtime

# =====================================================================
# TERMINAL UTILITIES & PRODUCTIVITY
# =====================================================================
# Navigation, search, and system information tools

# Navigation & search tools
brew "fzf"                    # Fuzzy finder for command line
brew "ripgrep"                # Fast text search tool
brew "fd"                     # Fast file/folder search
brew "tree"                   # Directory tree viewer
brew "zoxide"                 # Smart cd replacement

# File managers & system info
brew "yazi"                   # Terminal file manager (used in zsh function)
brew "fastfetch"              # System info tool (aliased as 's' in .zshrc)
brew "ncdu"                   # Interactive disk usage analyzer
brew "stow"                   # Symbolic link farm manager for dotfiles

# System monitoring
brew "htop"                   # Interactive process viewer
brew "btop"                   # Modern process monitor
brew "narugit/tap/smctemp"   # CPU temperature for tmux status (from narugit tap)
brew "osx-cpu-temp"           # macOS CPU temperature sensor

# Text processing & utilities
brew "jq"                     # Lightweight JSON processor
brew "wget"                   # Network downloader
brew "mole"                   # SSH connection manager

# Modern CLI enhancements
brew "bat"                    # cat clone with syntax highlighting and Git integration
brew "eza"                    # Modern, maintained replacement for ls

# =====================================================================
# EDITORS & TOOLS
# =====================================================================
# Text editors and version managers

brew "bob"                    # Neovim version manager (PATH in .zshrc)
cask "emacs-app"              # GNU Emacs text editor

# =====================================================================
# GITHUB & VERSION CONTROL
# =====================================================================
# GitHub CLI for terminal-based GitHub operations

brew "gh"                     # GitHub command-line tool

# =====================================================================
# PACKAGE MANAGERS
# =====================================================================
# Language package managers

brew "node"                   # JavaScript runtime
brew "pnpm"                   # Fast, disk space efficient package manager

# =====================================================================
# AI & DEVELOPMENT ASSISTANTS
# =====================================================================
# AI tools and development assistants

brew "anomalyco/tap/opencode"  # OpenCode AI coding agent

# =====================================================================
# LANGUAGES & RUNTIME
# =====================================================================
# Programming language runtimes

brew "openjdk"                # Java development kit

# =====================================================================
# DEVELOPMENT LIBRARIES
# =====================================================================
# Media processing libraries (available for neovim plugins)

brew "imagemagick"            # Image processing
brew "ffmpeg"                 # Video processing framework
brew "tesseract"              # OCR engine

# =====================================================================
# FONTS
# =====================================================================
# Nerd fonts for terminal icons and symbols

cask "font-jetbrains-mono-nerd-font"
cask "font-fira-code-nerd-font"
cask "font-symbols-only-nerd-font"

