# Linux Server Setup

This repository uses shared configuration with small Linux and SSH profiles. Do
not copy Neovim plugins, Mason packages, virtual environments, or caches from a
Mac.

## 806-dev Baseline

- Ubuntu 24.04 LTS, x86_64
- 20 physical cores / 40 logical CPUs, two NUMA nodes
- 62 GiB RAM, shared with other users
- tmux 3.4, Git, GCC 13, Python 3.12, Go, and uv are available
- zsh, Neovim, ripgrep, fd, clangd, CUDA, and environment modules are absent
- `tmux-256color` terminfo is installed; `kitten ssh` supplies `xterm-kitty`
- There is no NVIDIA GPU

## Deployment Rules

Install user-owned programs below `~/.local` when administrator packages are
not available. The `server/dev-tools.yml` micromamba environment provides the
portable command-line tools without modifying the system installation.

Install micromamba from its official binary artifact, then create the tools
prefix:

```bash
mkdir -p ~/.local/bin
curl -Ls https://micro.mamba.pm/api/micromamba/linux-64/latest \
  | tar -xvj -C ~/.local/bin --strip-components=1 bin/micromamba
export MAMBA_ROOT_PREFIX="$HOME/.local/share/micromamba"
~/.local/bin/micromamba create -y \
  -p "$HOME/.local/opt/dev-tools" \
  -f "$HOME/dotfiles/server/dev-tools.yml"
```

Install Neovim 0.11 or newer from its official Linux x86_64 release archive in
`~/.local/opt/nvim`. This is kept separate because conda-forge does not provide
the required Neovim executable version.

Do not run `micromamba shell init`. Zsh reads the tools prefix from `.zshenv`,
and tmux selects that zsh as its default shell for SSH sessions.

Only deploy the portable packages:

```bash
stow -t ~ zsh nvim tmux
```

Do not deploy `kitty`, `hammerspoon`, `gh`, or the macOS Brewfile on the server.
Keep the following directories local to each machine:

```text
~/.local/share/nvim
~/.local/state/nvim
~/.cache/nvim
~/.zim
~/.tmux/plugins
```

The environment provides ripgrep, fd, clangd, clang-format,
lua-language-server, stylua, and the tree-sitter CLI. The official archive
provides Neovim. Mason only installs a remote tool when no executable is already
available; installer concurrency is limited to two.

## Python And Triton

Create one environment per project and launch Neovim from the activated shell:

```bash
cd ~/projects/example
uv venv .venv
source .venv/bin/activate
uv pip install basedpyright ruff triton
nvim .
```

The Neovim configuration reads `$VIRTUAL_ENV/bin/python`. BasedPyright uses
open-files-only diagnostics and Ruff provides linting and formatting. Projects
may commit a `pyrightconfig.json`, but it must not contain a machine-specific
virtual environment path.

Without a GPU, run supported correctness checks through the Triton interpreter:

```bash
TRITON_INTERPRET=1 python main.py
```

Real CUDA execution and profiling belong on a temporary GPU machine.

## C, C++, And CUDA

Prefer an administrator or module-provided clangd when one becomes available.
Mason is the user-local fallback. Generate the compilation database per project:

```bash
cmake -S . -B build -G Ninja -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
cmake --build build --parallel 4
ln -sfn build/compile_commands.json compile_commands.json
```

Do not synchronize `compile_commands.json` between macOS and Linux. Keep CUDA
Toolkit paths in project-local configuration on Linux; do not add fake CUDA
paths on a Mac.

## Conservative Resource Use

Use four build jobs by default and increase to eight only when appropriate:

```bash
make -j4
ninja -j4
cmake --build build --parallel 4
```

Do not set global OpenMP, MPI, BLAS, or NUMA limits. Set them per experiment:

```bash
OMP_NUM_THREADS=4 OPENBLAS_NUM_THREADS=4 python main.py
```

## Login And Verification

Do not configure an unconditional `exec zsh` in Bash startup files because it
can break scp, rsync, and non-interactive SSH commands. Until zsh is the account
shell, start it explicitly with `zsh -l`.

The expected workflow is:

```bash
kitten ssh 806-dev
tmux new-session -A -s dev
cd ~/projects/example
source .venv/bin/activate
nvim .
```

Inside tmux, `$TERM` should be `tmux-256color`. Use `:LspInfo`, `:ConformInfo`,
and `:checkhealth` to verify the Neovim environment.
