# COC to LSPConfig Migration Guide

## Table of Contents
1. [Overview](#overview)
2. [Current Setup Analysis](#current-setup-analysis)
3. [Migration Steps](#migration-steps)
4. [Testing & Verification](#testing--verification)
5. [Troubleshooting](#troubleshooting)
6. [Cleanup](#cleanup)
7. [Reference](#reference)

---

## Overview

This guide helps you migrate from `coc.nvim` (Conquer of Completion) to the native `nvim-lspconfig` solution for Neovim's built-in LSP (Language Server Protocol) support.

### Why Migrate?

| Feature | coc.nvim | lspconfig |
|----------|-----------|------------|
| Installation | Node.js-based | Native Lua |
| Resource Usage | Higher memory | Lower memory |
| Startup Time | Slower | Faster |
| Maintenance | Requires Node.js ecosystem | Native Mason integration |
| Integration | Custom ecosystem | Native Neovim LSP API |
| Updates | Via coc marketplace | Via Mason |

---

## Current Setup Analysis

### Installed coc Extensions

Based on your `~/.config/coc/extensions/package.json`:

| coc Extension | Language | LSP Server Equivalent | Mason Package |
|---------------|-----------|----------------------|----------------|
| coc-json | JSON | `jsonls` | `json-lsp` |
| coc-tsserver | TypeScript/JavaScript | `ts_ls` | `typescript-language-server` |
| coc-vimlsp | Vim script | `vimls` | `vim-language-server` |
| coc-hls | Haskell | `hls` | `haskell-language-server` |
| coc-pyright | Python | `pyright` | `pyright` |
| coc-ccls | C/C++ | `ccls` or `clangd` | Manual or `clangd` |
| coc-lua | Lua | `lua_ls` | `lua-language-server` |

### Current Keybindings (from init.lua)

- `<TAB>` / `<S-TAB>` - Navigate completions
- `<CR>` - Accept completion
- `<c-space>` - Trigger completion

**Note:** These will be replaced by `blink.cmp` completion keymaps (already configured).

---

## Migration Steps

### Step 1: Update `lua/custom/plugins/lspconfig.lua`

Add the following language servers to the `servers` table:

```lua
local servers = {
  -- Existing Lua server
  lua_ls = {
    settings = {
      Lua = {
        completion = {
          callSnippet = 'Replace',
        },
        diagnostics = {
          disable = { 'missing-fields' },
        },
      },
    },
  },

  -- New servers to add
  ts_ls = {}, -- TypeScript/JavaScript support
  jsonls = {}, -- JSON support
  pyright = {}, -- Python support
  vimls = {}, -- Vim script support

  -- Optional (uncomment if needed):
  -- hls = {}, -- Haskell (requires GHC/haskell compiler)
  -- clangd = { -- Alternative to ccls for C/C++
  --   cmd = { 'clangd', '--background-index' },
  -- },
}
```

Update the `ensure_installed` list:

```lua
local ensure_installed = vim.tbl_keys(servers or {})
vim.list_extend(ensure_installed, {
  'stylua', -- Lua formatter
  -- Add language servers:
  'typescript-language-server',
  'json-lsp',
  'pyright',
  'vim-language-server',
  -- Optional:
  -- 'haskell-language-server',
})
```

**File path:** `/Users/liuguangxi/.config/nvim/lua/custom/plugins/lspconfig.lua`

**Action:** Edit the file and replace the `servers` table and `ensure_installed` list with the code above.

---

### Step 2: Remove coc.nvim Plugin

**Delete the coc.nvim plugin file:**

```bash
rm /Users/liuguangxi/.config/nvim/lua/custom/plugins/coc.lua
```

Or manually delete the file:
- File: `/Users/liuguangxi/.config/nvim/lua/custom/plugins/coc.lua`
- Content to remove:
  ```lua
  return {
    'neoclide/coc.nvim',
    branch = 'release',
  }
  ```

---

### Step 3: Remove coc Keybindings from init.lua

**Lines to remove (approximately 274-287):**

```lua
-- Remove these lines from init.lua:
local keyset = vim.keymap.set
-- Autocomplete
function _G.check_back_space()
  local col = vim.fn.col '.' - 1
  return col == 0 or vim.fn.getline('.'):sub(col, col):match '%s' ~= nil
end

-- Use Tab for trigger completion with characters ahead and navigate
local opts = { silent = true, noremap = true, expr = true, replace_keycodes = false }
keyset('i', '<TAB>', 'coc#pum#visible() ? coc#pum#next(1) : v:lua.check_back_space() ? "<TAB>" : coc#refresh()', opts)
keyset('i', '<S-TAB>', [[coc#pum#visible() ? coc#pum#prev(1) : "\<C-h>"]], opts)

-- Make <CR> to accept selected completion item or notify coc.nvim to format
keyset('i', '<cr>', [[coc#pum#visible() ? coc#pum#confirm() : "\<C-g>u\<CR>\<c-r>=coc#on_enter()\<CR>"]], opts)

-- Use <c-space> to trigger completion
keyset('i', '<c-space>', 'coc#refresh()', { silent = true, expr = true })
```

**Action:** Edit `/Users/liuguangxi/.config/nvim/init.lua` and remove the coc keybinding section.

---

### Step 4: Restart Neovim

After completing steps 1-3:

1. Save all files
2. Quit Neovim completely (`:qa`)
3. Restart Neovim

**What happens on startup:**
- lazy.nvim will detect that coc.nvim was removed
- Mason will download and install new language servers
- lspconfig will set up the new servers

---

### Step 5: Install Language Servers via Mason

After restart, open Neovim and run:

```vim
:Mason
```

**Expected installed servers:**
- ✅ lua-language-server (already present)
- ✅ typescript-language-server (new)
- ✅ json-lsp (new)
- ✅ pyright (new)
- ✅ vim-language-server (new)
- ⚠️ haskell-language-server (optional - may need manual setup)

**Install via Mason:**
- Navigate to each server in the Mason window
- Press `i` to install (if not already installed)
- Press `q` to quit Mason when done

---

## Testing & Verification

### Test Checklist

For each language, open a test file and verify:

#### 1. Python (`*.py`)
```bash
nvim test.py
```

**Test file:**
```python
def hello(name: str) -> str:
    """Greeting function"""
    return f"Hello, {name}!"

print(hello("World"))
```

**Verify:**
- [ ] LSP attaches (check `:LspInfo`)
- [ ] Diagnostics show (no red underlines)
- [ ] Go to definition works (`grd` on `hello`)
- [ ] Hover shows type hints (cursor on `name`)
- [ ] Code actions work (`gra` on function)
- [ ] Completion works (type `hel` + `<c-n>` or `<TAB>`)

#### 2. TypeScript (`*.ts`, `*.tsx`, `*.js`, `*.jsx`)

```bash
nvim test.ts
```

**Test file:**
```typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}

const user: User = { name: "Alice", age: 30 };
console.log(greet(user));
```

**Verify:**
- [ ] LSP attaches (`ts_ls`)
- [ ] Type checking works
- [ ] Auto-import suggestions
- [ ] Signature help shows function parameters

#### 3. JSON (`*.json`)

```bash
nvim test.json
```

**Test file:**
```json
{
  "name": "Test Project",
  "version": "1.0.0",
  "dependencies": {
    "neovim": "^0.10.0"
  }
}
```

**Verify:**
- [ ] JSON schema validation works
- [ ] Key completion works

#### 4. Vim Script (`*.vim`)

```bash
nvim test.vim
```

**Test file:**
```vim
" Test file for vimls
function! TestFunction()
  echo "Hello from Vim script!"
endfunction

call TestFunction()
```

**Verify:**
- [ ] LSP attaches
- [ ] Autocompletion for Vim functions

#### 5. Lua (`*.lua`) - Should Already Work

```bash
nvim test.lua
```

**Verify:**
- [ ] LSP still works (lua_ls)
- [ ] No regressions

### LSP Keymap Reference

Your current keymaps (from lspconfig.lua):

| Keymap | Mode | Action |
|---------|-------|--------|
| `grd` | n | Go to definition |
| `grr` | n | Find references (via Telescope) |
| `grn` | n | Rename symbol |
| `gra` | n, x | Code actions |
| `gri` | n | Go to implementation |
| `grD` | n | Go to declaration |
| `grt` | n | Go to type definition |
| `gO` | n | Document symbols (via Telescope) |
| `gW` | n | Workspace symbols (via Telescope) |
| `<leader>th` | n | Toggle inlay hints |
| `<leader>f` | n/v | Format buffer (via conform.nvim) |

### Completion Keymaps (blink.cmp)

Your completion system uses `blink.cmp` with `preset = 'default'`:

| Keymap | Action |
|---------|--------|
| `<c-y>` | Accept completion |
| `<c-n>` / `<down>` | Select next item |
| `<c-p>` / `<up>` | Select previous item |
| `<TAB>` / `<S-TAB>` | Navigate snippet placeholders |
| `<c-e>` | Hide completion menu |
| `<c-space>` | Open completion menu |
| `<c-k>` | Toggle signature help |

---

## Troubleshooting

### Issue: LSP Not Attaching

**Symptom:** `:LspInfo` shows "No active language server" for a file type

**Solutions:**

1. **Check file type:**
   ```vim
   :set filetype?
   ```

2. **Verify server config:**
   - Check if the server is listed in `lua/custom/plugins/lspconfig.lua`
   - Check for typos in server name (e.g., `ts_ls` vs `tsserver`)

3. **Check Mason:**
   ```vim
   :Mason
   ```
   - Verify the language server is installed
   - Install if missing

4. **Check LSP logs:**
   ```vim
   :LspLog
   :messages
   ```

### Issue: Completion Not Working

**Symptom:** No completions appear when typing

**Solutions:**

1. **Check blink.cmp:**
   - Run `:Lazy` and verify `blink.cmp` is loaded
   - Check for errors in blink.cmp section

2. **Check server capabilities:**
   ```vim
   :LspInfo
   ```
   - Ensure "completion" is supported

3. **Restart completion:**
   - Source the config: `:source %`
   - Or restart Neovim

### Issue: Diagnostics Not Showing

**Symptom:** Errors/warnings don't appear in editor

**Solutions:**

1. **Check diagnostic config (in lspconfig.lua):**
   - Verify `vim.diagnostic.config` is set correctly
   - Check `signs` and `virtual_text` options

2. **Force diagnostic refresh:**
   ```vim
   :doautocmd BufWritePost
   ```

3. **Check diagnostics:**
   ```vim
   :lua vim.diagnostic.get(0) -- Show diagnostics for current buffer
   ```

### Issue: Formatting Not Working

**Symptom:** `<leader>f` doesn't format or uses wrong formatter

**Solutions:**

1. **Check conform.nvim:**
   - Verify formatters are listed in `formatters_by_ft`
   - Check if the formatter is installed

2. **Test formatting manually:**
   ```vim
   :ConformInfo
   ```

3. **Install formatters via Mason:**
   - Open `:Mason`
   - Look for formatters (e.g., `prettier`, `black`)

### Issue: Haskell Language Server (hls)

**Symptom:** hls fails to install or start

**Reason:** `haskell-language-server` requires:
- GHC (Glasgow Haskell Compiler)
- Cabal
- Stack

**Solutions:**

1. **Install Haskell toolchain:**
   ```bash
   # macOS
   brew install ghc cabal-install stack
   
   # Or use ghcup (Haskell installer)
   curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
   ```

2. **Install hls manually:**
   ```bash
   stack install haskell-language-server
   ```

3. **Or skip Haskell support** if not actively used

### Issue: C/C++ Language Server (ccls)

**Symptom:** ccls fails to work

**Solutions:**

1. **Switch to clangd (recommended):**
   - Add to lspconfig.lua:
     ```lua
     clangd = {
       cmd = { 'clangd', '--background-index' },
     }
     ```

2. **Or build ccls from source:**
   - See: https://github.com/MaskRay/ccls#build

---

## Cleanup

### Remove coc Files

After confirming everything works:

```bash
# Remove coc extensions and data
rm -rf ~/.config/coc/extensions
rm -rf ~/.config/coc/extensions/node_modules

# Remove coc settings
rm ~/.config/nvim/coc-settings.json

# Remove coc data directories (optional - may contain cache)
rm -rf ~/.config/coc/extensions/coc-json-data
rm -rf ~/.config/coc/extensions/coc-lua-data

# Remove coc configuration file
rm ~/.config/nvim/coc-settings.json
```

### Verify Cleanup

Check if any coc files remain:

```bash
ls -la ~/.config/coc/
ls -la ~/.config/nvim/coc-settings.json 2>&1 || echo "coc-settings.json removed"
```

### Clean Mason Registry (Optional)

```vim
:Mason
```

Press `u` to uninstall any coc-related tools if they appear.

---

## Reference

### Useful Commands

| Command | Purpose |
|---------|---------|
| `:LspInfo` | Show attached language servers |
| `:LspLog` | Open LSP log file |
| `:Mason` | Open Mason package manager |
| `:MasonUpdate` | Update all Mason packages |
| `:ConformInfo` | Show available formatters |
| `:lua vim.lsp.*` | Execute LSP Lua functions |
| `:lua require('telescope.builtin').*` | Access Telescope pickers |

### File Locations

| Path | Purpose |
|------|---------|
| `~/.local/share/nvim/mason/` | Mason package installation directory |
| `~/.local/state/nvim/lsp.log` | LSP log file |
| `~/.config/nvim/lua/custom/plugins/lspconfig.lua` | LSP server configuration |
| `~/.config/nvim/lua/custom/plugins/blink.lua` | Completion configuration |
| `~/.config/nvim/lua/custom/plugins/conform.lua` | Formatter configuration |

### LSP Server Names Reference

Common language servers and their Mason package names:

| Language | LSP Server Name | Mason Package |
|-----------|------------------|---------------|
| Lua | `lua_ls` | `lua-language-server` |
| Python | `pyright`, `ruff_lsp` | `pyright`, `ruff-lsp` |
| TypeScript | `ts_ls` | `typescript-language-server` |
| JavaScript | `ts_ls` | `typescript-language-server` |
| JSON | `jsonls` | `json-lsp` |
| HTML | `html` | `html-lsp` |
| CSS | `cssls` | `css-lsp` |
| Go | `gopls` | `gopls` |
| Rust | `rust_analyzer` | `rust-analyzer` |
| C/C++ | `clangd`, `ccls` | `clangd` |
| Java | `jdtls` | `jdtls` |
| Ruby | `solargraph` | `solargraph` |

### Further Reading

- **Neovim LSP:** `:help lsp`
- **lspconfig docs:** https://github.com/neovim/nvim-lspconfig
- **Mason docs:** `:help mason.nvim`
- **blink.cmp docs:** https://cmp.saghen.dev/
- **conform.nvim docs:** https://github.com/stevearc/conform.nvim

---

## Summary

### Migration Complete When:

- [x] All coc.nvim keybindings removed from init.lua
- [x] `coc.lua` plugin deleted
- [x] Language servers configured in lspconfig.lua
- [x] All required language servers installed via Mason
- [x] LSP attaches correctly for each file type
- [x] Completion works (blink.cmp)
- [x] Diagnostics appear correctly
- [x] Keymaps work as expected
- [x] Formatting works (conform.nvim)
- [x] Coc files cleaned up

### Expected Benefits

- ✅ Faster startup time
- ✅ Lower memory usage
- ✅ Native Neovim integration
- ✅ Easier maintenance (no Node.js)
- ✅ Better community support (Mason ecosystem)

---

**Last Updated:** January 7, 2026
**Neovim Version:** 0.10+
