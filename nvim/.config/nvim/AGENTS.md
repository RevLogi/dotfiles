# Neovim Configuration Guide

## Layout

- `init.lua`: core options, keymaps, and lazy.nvim bootstrap
- `lua/custom/plugins/`: plugin specifications
- `lua/custom/platform.lua`: platform and remote-session detection
- `lua/lsp/`: shared LSP utilities and non-default server overrides
- `lua/kickstart/health.lua`: custom health checks

## Validation

```bash
stylua --check .
nvim --headless +qa
nvim --headless "+checkhealth kickstart" +qa
```

## Style

- Use two-space indentation, single quotes, and a 160-column limit.
- Plugin files return lazy.nvim specification tables.
- Use `require 'module.name'` for simple imports.
- Use `snake_case` for Lua names and descriptive `desc` values for keymaps.
- Keep platform-specific behavior behind `custom.platform` checks.
- Add an LSP module only when overriding the server's default configuration.
