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
| Tooling | GitHub CLI and Pi coding agent |

## Packages

```text
zsh/             Shared shell configuration
nvim/            Shared Neovim configuration
tmux/            Shared tmux configuration and platform profiles
vim/             Minimal fallback editor
kitty/           Kitty terminal configuration
gh/              GitHub CLI configuration without credentials
pi/              Pi coding agent configuration
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
stow -t ~ zsh nvim tmux vim kitty gh hammerspoon karabiner
stow --no-folding -t ~ pi
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
npm --prefix ~/.pi/agent ci
npm --prefix ~/.pi/agent/skills/youtube-transcript ci
```

The optional PDF material converter uses an isolated Python environment:

```bash
/usr/bin/python3 -m venv ~/.pi/agent/skills/material-mentor/.venv
~/.pi/agent/skills/material-mentor/.venv/bin/pip install \
  -r ~/.pi/agent/skills/material-mentor/requirements.txt
```

Run machine-local authentication separately with `gh auth login` and Pi's
`/login` command. The resulting credentials, sessions, package data, caches,
and runtime state are ignored.

CodeCompanion chat authenticates through ChatGPT when first opened. Its ACP
chat is the single Neovim AI entry point, so no OpenAI API key is required.

## Material-first learning with Pi

The Pi package includes a `material-mentor` skill, `/learn`, `/learn-modern`,
`/check`, `/review`, `/explore`, and `/checkpoint` prompts, an interactive
`ask_user` tool, course-aware state injection, material write protection,
dangerous-shell confirmation, a lightweight file-change list, and the `/btw`
side channel. The course itself stays in an Obsidian-readable folder of
ordinary Markdown files.

Initialize a course, add human-written source material, and start Pi from that
course directory:

```bash
~/.pi/agent/skills/material-mentor/scripts/init-course.sh \
  ~/Documents/Obsidian/MyVault/Learning/CII \
  "C Interfaces and Implementations"
cd ~/Documents/Obsidian/MyVault/Learning/CII
pi
```

Then use `/learn` or `/learn-modern` to choose a bounded chunk, `/check` after
reading, `/review` for retrieval practice, `/explore` for a controlled detour,
`/checkpoint` to persist evidence, and `/btw` for a disposable side question.
Pi may update `COURSE.md`, `PROGRESS.md`, `QUESTIONS.md`, and compact notes under
`sessions/`; material and learner-authored concept notes remain human-owned.

See the [Chinese usage guide](docs/material-mentor.md) for the complete daily
workflow, file ownership rules, Obsidian integration, and troubleshooting.

## Common Bindings

| Context | Binding | Action |
|---------|---------|--------|
| Zsh | `c` / `d` | Open `~/Developer/Projects` / `~/Developer` |
| Zsh | `o` / `t` / `nv` | Pi / tmux / Neovim |
| tmux | `C-f` | Prefix |
| tmux | `C-f i` | Smart pane split |
| tmux/Neovim | `C-h/j/k/l` | Navigate panes and splits |
| Neovim | `Space a c` / `Space a a` | Toggle AI chat / open AI actions |
| Neovim | `Space a x` | Open files changed by CodeCompanion |
| KDE | `Alt+S` / `Alt+K` | Focus Firefox / Kitty |

Configuration files are symlinked into `$HOME`; edits through either path
update this repository.
