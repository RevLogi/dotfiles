# AGENTS.md

## Build/Lint/Test Commands

This is a Neovim configuration (kickstart.nvim) - no traditional build/test commands.

- **Format code**: `stylua .`
- **Check health**: `nvim -c "checkhealth | q"` or run `:checkhealth` inside Neovim
- **Validate config**: Launch nvim and check for startup errors
- **Plugin management**: `:Lazy` inside Neovim to manage plugins

## Code Style Guidelines

### Project Structure
- **Main config**: `init.lua` contains core configuration
- **Plugin configs**: `lua/kickstart/plugins/` for kickstart plugins, `lua/plugins/` for custom plugins
- **Custom configs**: `lua/custom/plugins/` for user plugins (no merge conflicts in this dir)
- **Health checks**: `lua/kickstart/health.lua`

### Formatting (stylua)
- **Column width**: 160 characters
- **Indentation**: 2 spaces (no tabs)
- **Quote style**: Prefer single quotes `'`, use double quotes `"` only when single quotes in string
- **Call parentheses**: None for simple calls, parentheses for nested calls

### Code Conventions

#### Plugin Specifications
All plugin files must return a table for lazy.nvim:

```lua
return {
  'plugin-author/plugin-name',
  dependencies = { 'dependency1', 'dependency2' },
  event = 'InsertEnter',
  opts = { -- simple configuration
    key = 'value',
  },
  -- OR for complex configuration
  config = function()
    local plugin = require 'plugin-name'
    -- setup code
  end,
  keys = {
    { '<leader>key', function() ... end, desc = 'Description' },
  },
}
```

#### Imports
- Use `require 'module.name'` (no parentheses for simple requires)
- Cache requires in local variables when used multiple times:
  ```lua
  local gitsigns = require 'gitsigns'
  ```
- Use `vim.keymap.set` for keymaps, `vim.api.nvim_*` for API functions

#### Naming Conventions
- **Variables/Functions**: `snake_case`
- **Modules/Files**: `snake_case.lua`
- **Constants**: `UPPER_SNAKE_CASE`
- **Plugin names**: Follow lazy.nvim convention `'author/plugin'`

#### Comments
- **Single line**: `-- comment`
- **Multi-line**: `--[[ comment block --]]`
- **Documentation comments**: Use `--:` or `---@` for type annotations
- Add `:help` references: `-- See :help option-name`

#### Keymaps
- Use table format: `{ mode, lhs, rhs, opts }`
- Always include `desc` field for description
- Use `<leader>` for leader key mappings
- Example:
  ```lua
  { 'n', '<leader>ff', function() ... end, desc = '[F]ind [F]iles' }
  ```

#### Autocommands
- Create augroups with clear option: `vim.api.nvim_create_augroup('name', { clear = true })`
- Use descriptive pattern matching in autocmd events
- Include buffer-specific opts when needed:

  ```lua
  vim.api.nvim_create_autocmd('BufWritePost', {
    group = augroup,
    callback = function()
      -- action
    end,
  })
  ```

#### Error Handling
- Use `pcall` for safe require calls
- Check function existence before calling: `if vim.fn.executable 'cmd' == 1 then`
- Wrap complex logic in try-catch patterns using `pcall`

#### Plugin Config Style
- **Simple configs**: Use `opts = { ... }`
- **Complex configs**: Use `config = function() ... end`
- **Nested plugins**: Return array of plugin specs in one file
- **Dependencies**: List as array in `dependencies` field

#### Neovim API
- Use `vim.o.option` or `vim.opt.option` for setting options
- Use `vim.g.variable` for global variables
- Use `vim.bo[bufnr].option` for buffer options
- Use `vim.wo[winid].option` for window options
- Prefer `vim.schedule` for deferred execution

#### Module Returns
- Plugin files: Always return lazy.nvim spec table
- Utility modules: Return function or table with methods
- Health modules: Return `{ check = function() ... end }`

### File Organization
- Keep related plugins in the same file
- Use descriptive filenames: `debug.lua`, `autopairs.lua`, `lint.lua`
- Add file header comments describing purpose
- Keep plugin configs focused on single responsibility

### Common Patterns
1. **Keymap helper function** (when needed):
   ```lua
   local function map(mode, l, r, opts)
     opts = opts or {}
     opts.buffer = bufnr
     vim.keymap.set(mode, l, r, opts)
   end
   ```

2. **Plugin setup with config function**:
   ```lua
   config = function()
     local plugin = require 'plugin'
     plugin.setup {
       option = value,
     }
   end
   ```

3. **Conditional features**:
   ```lua
   if vim.g.have_nerd_font then
     -- code requiring nerd font
   end
   ```

### Best Practices
- Keep plugin configurations simple when possible
- Use lazy loading via `event`, `cmd`, `keys`, or `ft` fields
- Document non-obvious keybindings with descriptive text
- Follow lazy.nvim specification patterns
- Test config by launching Neovim after changes
- Use `:Lazy` to check plugin status
- Run `:checkhealth kickstart` to verify setup
