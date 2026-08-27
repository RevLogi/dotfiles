# Dotfiles Agent Guide

## Scope

- This repository is deployed with GNU Stow; preserve paths relative to the target home directory.
- Keep configuration portable across macOS, Fedora, and remote Linux unless a file is explicitly platform-specific.
- Preserve unrelated working-tree changes. Never discard or rewrite them while completing another task.

## Safety

- Never read, print, copy, or commit credentials, OAuth tokens, cookies, or machine-local secrets.
- Treat `~/.pi/agent/auth.json`, runtime sessions, downloaded packages, caches, and browser profiles as private state.
- Use one writing agent per worktree. A second agent may review with read-only tools after the first has stopped editing.
- Resolve exact paths before deletion or other destructive operations and prefer recoverable changes.

## Validation

- Inspect `git diff` and `git status --short` after changes.
- For Neovim changes, run `stylua --check nvim/.config/nvim` and `nvim --headless +qa`.
- For Pi extension changes, run `npm --prefix ~/.pi/agent run check` after installing its development dependencies.
- Do not claim a check passed unless its command completed successfully.

## AI Workflow

- Use CodeCompanion for editor-local explanation, context gathering, and independent diff review.
- Use Pi for repository-scale implementation and test orchestration from the project root.
- Use `pi --tools read,grep,find,ls` for audits that must remain read-only.
- Keep compilation, watch processes, and long-running services in dedicated tmux panes.
