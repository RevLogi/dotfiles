# OrbStack Configuration

This directory contains OrbStack configuration files.

**Note:** OrbStack configs are manually synced (not managed by Stow) to avoid version control issues with transient state files.

## Files

- `vmconfig.json` - VM configuration (CPU, memory, disk settings)
- `config/docker.json` - Docker-specific settings
- `vmstate.json` - Excluded (transient VM state)

## Manual Sync

To sync OrbStack configs between machines:

```bash
# Export config to dotfiles
cp ~/.orbstack/vmconfig.json ~/dotfiles/orbstack/.orbstack/
cp ~/.orbstack/config/docker.json ~/dotfiles/orbstack/.orbstack/config/

# Commit changes
cd ~/dotfiles
git add orbstack/
git commit -m "Update OrbStack configuration"
git push origin main

# On another machine, import config
cp ~/dotfiles/orbstack/.orbstack/vmconfig.json ~/.orbstack/
cp ~/dotfiles/orbstack/.orbstack/config/docker.json ~/.orbstack/config/
```

## Installation

OrbStack is installed via Homebrew (see Brewfile):

```bash
brew install orbstack
```

This automatically sets up binary symlinks:
- `/usr/local/bin/orb`
- `/usr/local/bin/orbctl`
- `/usr/local/bin/docker`
- `/usr/local/bin/docker-compose`
- `/usr/local/bin/kubectl`

## Usage

See README.md for detailed usage examples.
