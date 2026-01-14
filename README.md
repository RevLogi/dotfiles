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
