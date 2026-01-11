# Coc-Like Keybindings for blink.cmp Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Current Setup Analysis](#current-setup-analysis)
3. [Keybinding Options](#keybinding-options)
4. [Implementation Steps](#implementation-steps)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)
7. [Reference](#reference)

---

## Overview

This guide helps you configure `blink.cmp` to use keybindings similar to your previous `coc.nvim` setup.

### Why blink.cmp?

| Feature | coc.nvim | blink.cmp |
|----------|-----------|------------|
| Performance | Node.js based | Native Lua (faster) |
| Integration | coc ecosystem | Native Neovim LSP |
| Keymaps | Custom via coc | Flexible presets or custom |
| Snippets | Built-in | LuaSnip integration |
| Maintenance | coc marketplace | Native updates |

### Your Previous coc.nvim Keybindings

| Key | Action |
|------|--------|
| `<TAB>` | Navigate to next completion item |
| `<S-TAB>` | Navigate to previous completion item |
| `<CR>` | Accept selected completion item |
| `<c-space>` | Trigger completion |

**Goal:** Replicate this behavior in blink.cmp.

---

## Current Setup Analysis

### Current blink.cmp Configuration

**File:** `/Users/liuguangxi/.config/nvim/lua/custom/plugins/blink.lua`

```lua
opts = {
  keymap = {
    preset = 'default',
  },
  -- ... other options
}
```

### Current Default Behavior (preset = 'default')

| Key | Action |
|------|--------|
| `<c-y>` | Accept completion |
| `<c-n>` / `<down>` | Select next item |
| `<c-p>` / `<up>` | Select previous item |
| `<TAB>` / `<S-TAB>` | Navigate snippet placeholders |
| `<c-e>` | Hide completion menu |
| `<c-space>` | Open completion menu |
| `<c-k>` | Toggle signature help |

### Differences from Coc

| Behavior | Coc | blink.cmp default |
|-----------|------|------------------|
| Navigate items | Tab/S-Tab | Ctrl-n/Ctrl-p |
| Accept | CR | Ctrl-y |
| Trigger | c-space | c-space ✅ |

---

## Keybinding Options

I'll present **3 options** ranging from preset-based to fully custom configuration.

---

### Option 1: Use 'super-tab' Preset (Easiest)

**Description:**
Uses built-in Tab-based navigation preset with minimal configuration.

**Pros:**

- ✅ Minimal code change
- ✅ Maintains blink.cmp defaults
- ✅ Tab/S-Tab for navigation (like coc)
- ✅ Well-tested by blink.cmp community

**Cons:**
- ❌ Doesn't map CR to accept (still uses c-y)
- ❌ Different from exact coc behavior

**Configuration:**

Edit `/Users/liuguangxi/.config/nvim/lua/custom/plugins/blink.lua`:

```lua
return {
  'saghen/blink.cmp',
  event = 'VimEnter',
  version = '1.*',
  dependencies = {
    {
      'L3MON4D3/LuaSnip',
      version = '2.*',
      build = (function()
        if vim.fn.has 'win32' == 1 or vim.fn.executable 'make' == 0 then
          return
        end
        return 'make install_jsregexp'
      end)(),
      dependencies = {},
      opts = {},
    },
    'folke/lazydev.nvim',
  },
  ---@module 'blink.cmp'
  ---@type blink.cmp.Config
  opts = {
    keymap = {
      preset = 'super-tab',  -- Changed from 'default'
    },
    appearance = {
      nerd_font_variant = 'mono',
    },
    completion = {
      documentation = { auto_show = false, auto_show_delay_ms = 500 },
    },
    sources = {
      default = { 'lsp', 'path', 'snippets', 'lazydev' },
      providers = {
        lazydev = { module = 'lazydev.integrations.blink', score_offset = 100 },
      },
    },
    snippets = { preset = 'luasnip' },
    fuzzy = { implementation = 'lua' },
    signature = { enabled = true },
  },
}
```

**Resulting Keymaps:**

| Key | Action | Match Coc? |
|------|--------|------------|
| `<TAB>` / `<S-TAB>` | Navigate items | ✅ |
| `<TAB>` / `<S-TAB>` | Navigate snippet placeholders | ✅ |
| `<c-e>` | Hide menu | ✅ |
| `<c-y>` | Accept completion | ❌ (coc used CR) |
| `<c-space>` | Open completion menu | ✅ |

---

### Option 2: Use 'super-tab' + CR Accept (Recommended)

**Description:**
Uses super-tab preset and adds custom CR mapping for acceptance.

**Pros:**
- ✅ Tab navigation (like coc)
- ✅ CR to accept (like coc)
- ✅ Fallback to c-y still works
- ✅ Simple configuration
- ✅ Best balance of familiarity and maintainability

**Cons:**

- Slightly more config than Option 1

**Configuration:**

Edit `/Users/liuguangxi/.config/nvim/lua/custom/plugins/blink.lua`:

```lua
return {
  'saghen/blink.cmp',
  event = 'VimEnter',
  version = '1.*',
  dependencies = {
    {
      'L3MON4D3/LuaSnip',
      version = '2.*',
      build = (function()
        if vim.fn.has 'win32' == 1 or vim.fn.executable 'make' == 0 then
          return
        end
        return 'make install_jsregexp'
      end)(),
      dependencies = {},
      opts = {},
    },
    'folke/lazydev.nvim',
  },
  ---@module 'blink.cmp'
  ---@type blink.cmp.Config
  opts = {
    keymap = {
      preset = 'super-tab',
      ['accept'] = { '<cr>', '<c-y>' },  -- Added CR accept
    },
    appearance = {
      nerd_font_variant = 'mono',
    },
    completion = {
      documentation = { auto_show = false, auto_show_delay_ms = 500 },
    },
    sources = {
      default = { 'lsp', 'path', 'snippets', 'lazydev' },
      providers = {
        lazydev = { module = 'lazydev.integrations.blink', score_offset = 100 },
      },
    },
    snippets = { preset = 'luasnip' },
    fuzzy = { implementation = 'lua' },
    signature = { enabled = true },
  },
}
```

**Resulting Keymaps:**

| Key | Action | Match Coc? |
|------|--------|------------|
| `<TAB>` / `<S-TAB>` | Navigate items | ✅ |
| `<TAB>` / `<S-TAB>` | Navigate snippet placeholders | ✅ |
| `<CR>` | Accept completion | ✅ |
| `<c-y>` | Accept completion (fallback) | ✅ |
| `<c-e>` | Hide menu | ✅ |
| `<c-space>` | Open completion menu | ✅ |

---

### Option 3: Fully Custom Keymaps (Exact Coc Match)

**Description:**
Disables presets and defines every keymap manually for exact coc behavior.

**Pros:**
- ✅ Exact coc keybinding behavior
- ✅ Full control over every mapping
- ✅ Tab for both completion and snippet navigation

**Cons:**
- ❌ More verbose configuration
- ❌ Need to specify all mappings manually
- ❌ Higher maintenance burden

**Configuration:**

Edit `/Users/liuguangxi/.config/nvim/lua/custom/plugins/blink.lua`:

```lua
return {
  'saghen/blink.cmp',
  event = 'VimEnter',
  version = '1.*',
  dependencies = {
    {
      'L3MON4D3/LuaSnip',
      version = '2.*',
      build = (function()
        if vim.fn.has 'win32' == 1 or vim.fn.executable 'make' == 0 then
          return
        end
        return 'make install_jsregexp'
      end)(),
      dependencies = {},
      opts = {},
    },
    'folke/lazydev.nvim',
  },
  ---@module 'blink.cmp'
  ---@type blink.cmp.Config
  opts = {
    keymap = {
      preset = 'none',  -- Disable preset to use custom keys
      ['show'] = { '<c-space>' },
      ['hide'] = { '<c-e>', '<esc>' },
      ['accept'] = { '<cr>', '<c-y>' },
      ['select_next'] = { '<tab>', '<down>' },
      ['select_prev'] = { '<s-tab>', '<up>' },
      ['scroll_documentation_down'] = { '<c-f>', '<c-d>' },
      ['scroll_documentation_up'] = { '<c-b>', '<c-u>' },
      ['snippet_forward'] = '<tab>',
      ['snippet_backward'] = '<s-tab>',
    },
    appearance = {
      nerd_font_variant = 'mono',
    },
    completion = {
      documentation = { auto_show = false, auto_show_delay_ms = 500 },
    },
    sources = {
      default = { 'lsp', 'path', 'snippets', 'lazydev' },
      providers = {
        lazydev = { module = 'lazydev.integrations.blink', score_offset = 100 },
      },
    },
    snippets = { preset = 'luasnip' },
    fuzzy = { implementation = 'lua' },
    signature = { enabled = true },
  },
}
```

**Resulting Keymaps (exact coc match):**

| Key | Action | Match Coc? |
|------|--------|------------|
| `<TAB>` | Next completion item | ✅ |
| `<TAB>` | Next snippet placeholder | ✅ |
| `<S-TAB>` | Previous completion item | ✅ |
| `<S-TAB>` | Previous snippet placeholder | ✅ |
| `<CR>` | Accept completion | ✅ |
| `<c-y>` | Accept completion (fallback) | ✅ |
| `<c-space>` | Show completion menu | ✅ |
| `<c-e>` / `<esc>` | Hide menu | ✅ |
| `<c-f>` / `<c-d>` | Scroll docs down | ✅ |
| `<c-b>` / `<c-u>` | Scroll docs up | ✅ |

---

## Implementation Steps

### Step 1: Choose Your Option

Review the three options above and decide:

- **Option 1** (super-tab preset) - Easiest, but CR doesn't accept
- **Option 2** (super-tab + CR) - **Recommended balance**
- **Option 3** (fully custom) - Exact coc behavior, most config

### Step 2: Edit blink.lua Configuration

**File location:** `/Users/liuguangxi/.config/nvim/lua/custom/plugins/blink.lua`

**Edit instructions:**

1. Open Neovim
2. Edit the file: `:e lua/custom/plugins/blink.lua`
3. Locate the `keymap` section (around line 23-25)
4. Replace the `keymap` table with your chosen option
5. Save the file (`:w`)

**For Option 1:**
```lua
keymap = {
  preset = 'super-tab',
},
```

**For Option 2:**
```lua
keymap = {
  preset = 'super-tab',
  ['accept'] = { '<cr>', '<c-y>' },
},
```

**For Option 3:**
```lua
keymap = {
  preset = 'none',
  ['show'] = { '<c-space>' },
  ['hide'] = { '<c-e>', '<esc>' },
  ['accept'] = { '<cr>', '<c-y>' },
  ['select_next'] = { '<tab>', '<down>' },
  ['select_prev'] = { '<s-tab>', '<up>' },
  ['scroll_documentation_down'] = { '<c-f>', '<c-d>' },
  ['scroll_documentation_up'] = { '<c-b>', '<c-u>' },
  ['snippet_forward'] = '<tab>',
  ['snippet_backward'] = '<s-tab>',
},
```

### Step 3: Restart Neovim

1. Save the file
2. Quit Neovim completely: `:qa`
3. Restart Neovim

**Why restart?**
- lazy.nvim needs to reload plugin configuration
- blink.cmp initializes on startup

### Step 4: Verify Configuration Load

After restart, check if blink.cmp loaded correctly:

```vim
:Lazy
```

In the Lazy window:
- Navigate to `blink.cmp`
- Verify status shows "Loaded" (green checkmark)
- Press `q` to quit

Alternatively, check for errors:

```vim
:messages
```

Look for any blink.cmp errors during startup.

---

## Testing & Verification

### Test 1: Basic Completion

**Steps:**
1. Open a Python/TypeScript/Lua file
2. Type a function name that should complete
3. Example in Python:
   ```python
   pri<TAB>  # Should complete to "print"
   ```

**Expected behavior (all options):**
- [ ] Completion menu appears
- [ ] Press `<TAB>` → Selects next item
- [ ] Press `<S-TAB>` → Selects previous item
- [ ] Press `<CR>` → Accepts completion (Options 2 & 3)

### Test 2: Trigger Completion Manually

**Steps:**

1. Move cursor to empty line
2. Press `<c-space>`

**Expected behavior:**

- [ ] Completion menu appears (if context allows)
- [ ] All available items shown

### Test 3: Snippet Expansion

**Prerequisite:** Have snippets installed (e.g., LuaSnip with friendly-snippets)

**Steps:**
1. Type a snippet trigger
2. Example in Lua:
   ```lua
   loc<TAB>  # Should expand to "local"
   ```

**Expected behavior:**
- [ ] Snippet expands
- [ ] Press `<TAB>` → Jump to next placeholder
- [ ] Press `<S-TAB>` → Jump to previous placeholder
- [ ] After placeholders, Tab continues to completion items

### Test 4: Fallback Keys (Options 2 & 3)

**Steps:**
1. Trigger completion
2. Press `<c-y>`

**Expected behavior:**
- [ ] Completion accepts (same as `<CR>`)

### Test 5: Documentation Scrolling (Option 3)

**Steps:**
1. Trigger completion with documentation visible
2. Press `<c-f>` or `<c-d>`

**Expected behavior:**
- [ ] Documentation window scrolls down

---

### Test 6: Verify No Conflicts

**Check for keymap conflicts:**

1. Open a test file
2. Test each keybinding:
   - `<TAB>` - Should not conflict with indentation
   - `<S-TAB>` - Should work for completion
   - `<CR>` - Should accept, not just newline (in completion context)

**If conflicts occur:**
- Check init.lua for conflicting keymaps
- Check other plugin configurations

### Verification Checklist

After implementing and testing:

- [ ] Completion menu appears when typing
- [ ] `<TAB>` navigates to next item
- [ ] `<S-TAB>` navigates to previous item
- [ ] `<CR>` accepts completion (Options 2 & 3)
- [ ] `<c-space>` triggers completion
- [ ] Snippet expansion works with Tab navigation
- [ ] No keymap conflicts in `:messages`
- [ ] blink.cmp shows as "Loaded" in `:Lazy`
- [ ] Fallback keys work (c-y, etc.)

---

## Troubleshooting

### Issue: Tab Doesn't Navigate Completions

**Symptoms:**
- Tab still indents line instead of navigating items
- Completion menu appears but Tab ignores it

**Causes:**
1. Configuration not loaded
2. Conflicting keymap
3. Preset not applied correctly

**Solutions:**

1. **Verify configuration loaded:**
   ```vim
   :Lazy
   ```
   - Check blink.cmp status
   - Reload if needed: `:Lazy reload blink.cmp`

2. **Check for conflicts:**
   ```vim
   :verbose map <tab>
   ```
   - Look for other Tab mappings
   - Remove or adjust conflicting maps

3. **Restart Neovim:**
   - Sometimes hot-reload doesn't work
   - Full restart ensures configuration loads

4. **Check blink.cmp version:**
   - Ensure version is `'1.*'` (configured in plugin spec)
   - Update if needed: `:Lazy update`

### Issue: CR Doesn't Accept Completion

**Symptoms:**
- Pressing Enter creates newline instead of accepting
- Only `<c-y>` accepts

**Causes:**
1. Option 1 being used (no CR mapping)
2. Custom mapping incorrect
3. Keymap override from elsewhere

**Solutions:**

1. **Check configuration:**
   - Verify you're using Option 2 or 3
   - Check for typos: `['accept'] = { '<cr>', '<c-y>' }`

2. **Test with debug:**
   ```vim
   :lua print(vim.inspect(require('blink.cmp').config.keymap))
   ```
   - Verify 'accept' key is set
   - Check key format: `'<cr>'` not `'<CR>'`

3. **Check for overrides:**
   ```vim
   :verbose map <cr>
   ```
   - Look for other CR mappings that interfere
   - Adjust priority or remove conflicts

### Issue: Snippet Tab Doesn't Work

**Symptoms:**
- Tab doesn't jump between placeholders
- Only completes items

**Causes:**
1. LuaSnip not loaded
2. Snippet integration disabled
3. Preset overriding snippet keys

**Solutions:**

1. **Verify LuaSnip installed:**
   ```vim
   :Lazy
   ```
   - Check `LuaSnip` status

2. **Check snippet configuration:**
   ```lua
   snippets = { preset = 'luasnip' },
   ```
   - Verify this line exists in blink.lua opts

3. **Test snippet directly:**
   ```vim
   :lua require('luasnip').available()()
   ```
   - Should list available snippets

4. **Use Option 3 for exact behavior:**
   ```lua
   ['snippet_forward'] = '<tab>',
   ['snippet_backward'] = '<s-tab>',
   ```

### Issue: Completion Slow or Laggy

**Symptoms:**
- Completion appears delayed
- Typing feels sluggish

**Causes:**
1. Fuzzy matcher implementation
2. Too many sources
3. Large documentation

**Solutions:**

1. **Check fuzzy implementation:**
   ```lua
   fuzzy = { implementation = 'lua' },  -- Recommended
   ```
   - Change from 'rust' to 'lua' if needed

2. **Disable auto-show documentation:**
   ```lua
   documentation = { auto_show = false },
   ```
   - Already configured in your setup

3. **Review sources:**
   ```lua
   sources = {
     default = { 'lsp', 'path', 'snippets', 'lazydev' },
   }
   ```
   - Remove unnecessary sources if not needed

### Issue: Keymap Format Errors

**Symptoms:**
- Lua error on startup about keymap format
- blink.cmp fails to load

**Causes:**
1. Using wrong key format (e.g., `<CR>` vs `<cr>`)
2. Invalid key names
3. Syntax errors in keymap table

**Solutions:**

1. **Use correct format:**
   - Lowercase: `'<cr>'`, `'<c-y>'`, `'<tab>'`
   - Not uppercase: `'<CR>'`, `'<C-Y>'`, `'<TAB>'`

2. **Check syntax:**
   - Commas after each table entry
   - Proper array syntax for multiple keys: `{ '<cr>', '<c-y>' }`
   - Matching braces

3. **Test configuration:**
   ```vim
   :luafile %
   ```
   - Errors will appear in `:messages`

### Issue: Completion Not Triggering

**Symptoms:**
- No completion menu appears
- Manually triggering doesn't work

**Causes:**
1. LSP not attached
2. blink.cmp disabled
3. Keymap not set for 'show'

**Solutions:**

1. **Check LSP status:**
   ```vim
   :LspInfo
   ```
   - Ensure language server is attached

2. **Verify 'show' keymap (Option 3):**
   ```lua
   ['show'] = { '<c-space>' },
   ```

3. **Check blink.cmp enabled:**
   ```vim
   :Lazy
   ```
   - Ensure blink.cmp is loaded

4. **Restart Neovim:**
   - Full restart often resolves startup issues

---

## Reference

### Available Keymap Actions

| Action Key | Description | Recommended Keys |
|-------------|--------------|-------------------|
| `['accept']` | Accept selected completion item | `<cr>`, `<c-y>` |
| `['show']` | Show completion menu | `<c-space>` |
| `['hide']` | Hide completion menu | `<c-e>`, `<esc>` |
| `['select_next']` | Select next item in menu | `<tab>`, `<down>`, `<c-n>` |
| `['select_prev']` | Select previous item in menu | `<s-tab>`, `<up>`, `<c-p>` |
| `['scroll_documentation_down']` | Scroll docs window down | `<c-f>`, `<c-d>` |
| `['scroll_documentation_up']` | Scroll docs window up | `<c-b>`, `<c-u>` |
| `['snippet_forward']` | Jump to next snippet placeholder | `<tab>` |
| `['snippet_backward']` | Jump to previous snippet placeholder | `<s-tab>` |
| `['fallback']` | Fallback when no match | (rarely used) |

### Blink.cmp Presets

| Preset | Description | Default Behavior |
|---------|--------------|------------------|
| `'default'` | Standard Emacs-style keybindings | c-y accept, c-n/p navigate |
| `'super-tab'` | Tab-based navigation | Tab navigate, c-y accept |
| `'enter'` | Enter to accept | CR accept, arrows navigate |

### Key Naming Convention

blink.cmp uses **lowercase** key names:

| Correct | Incorrect | Note |
|---------|-------------|-------|
| `<cr>` | `<CR>` | Use lowercase |
| `<c-y>` | `<C-Y>` | Use lowercase modifier |
| `<tab>` | `<TAB>` | Use lowercase |
| `<s-tab>` | `<S-TAB>` | Use lowercase |
| `<space>` | `<SPACE>` | Use lowercase |

**Always use lowercase for keys in Lua strings!**

### File Location

**Configuration file:** `/Users/liuguangxi/.config/nvim/lua/custom/plugins/blink.lua`

**Quick access:**
```vim
:e lua/custom/plugins/blink.lua
```

### Comparison Table

| Feature | Option 1 (super-tab) | Option 2 (super-tab + CR) | Option 3 (Custom) |
|----------|----------------------|------------------------------|-------------------|
| Tab navigation | ✅ | ✅ | ✅ |
| CR accept | ❌ | ✅ | ✅ |
| c-y fallback | ✅ | ✅ | ✅ |
| Config complexity | Low | Medium | High |
| Coc similarity | 75% | 95% | 100% |
| Maintenance | Easy | Easy | Medium |
| Recommended | Backup | **Yes** | Advanced users |

### Testing File Examples

#### Python Test File

Create `test_completion.py`:

```python
def greet(name: str) -> str:
    """Greet someone by name"""
    return f"Hello, {name}!"

# Test completion:
# 1. Type 'pri' + TAB → should suggest 'print'
# 2. Type 'gre' + TAB → should suggest 'greet'
# 3. After greet(, type 'name' → should see type hint
```

#### TypeScript Test File

Create `test_completion.ts`:

```typescript
interface User {
    name: string;
    age: number;
}

function greet(user: User): string {
    return `Hello, ${user.name}!`;
}

// Test completion:
// 1. Type 'User' → should see interface
// 2. Type 'gre' + TAB → should see 'greet'
// 3. Inside greet, type 'user.' → should see name, age
```

#### Lua Test File

Create `test_completion.lua`:

```lua
-- Test completion
local function hello(name)
    return "Hello, " .. name .. "!"
end

-- Test completion:
-- 1. Type 'loca' + TAB → should suggest 'local'
-- 2. Type 'pri' + TAB → should suggest 'print'
-- 3. Type 'vim.api.' → should see available API functions
```

### Additional Resources

- **blink.cmp documentation:** https://cmp.saghen.dev/
- **Keymapping guide:** https://cmp.saghen.dev/docs/keymaps
- **Neovim completion help:** `:help ins-completion`
- **LuaSnip docs:** https://github.com/L3MON4D3/LuaSnip

---

## Summary

### Migration Complete When:

- [ ] blink.lua configuration updated with chosen option
- [ ] Neovim restarted
- [ ] blink.cmp shows as "Loaded" in `:Lazy`
- [ ] Tab navigates completion items
- [ ] S-Tab navigates completion items
- [ ] CR accepts completion (Options 2 & 3)
- [ ] c-space triggers completion
- [ ] Snippet expansion works
- [ ] No keymap conflicts in `:messages`
- [ ] All tests pass successfully

### Expected Benefits

- ✅ Faster completion (native Lua)
- ✅ Lower memory usage
- ✅ Familiar Tab-based navigation
- ✅ CR to accept (Options 2 & 3)
- ✅ Better integration with Neovim LSP
- ✅ Consistent with other Neovim plugins

### Recommendation

**Start with Option 2** (super-tab + CR accept) as it provides:
- Familiar Tab navigation
- CR to accept (like coc)
- Minimal configuration
- Fallback keymaps preserved
- Easy to adjust later if needed

---

**Last Updated:** January 7, 2026
**Neovim Version:** 0.10+
**blink.cmp Version:** 1.*
