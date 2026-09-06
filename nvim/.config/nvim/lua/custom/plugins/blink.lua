return {
  'saghen/blink.cmp',
  event = 'VimEnter',
  version = '1.*',
  dependencies = { 'folke/lazydev.nvim' },
  ---@module 'blink.cmp'
  ---@type blink.cmp.Config
  opts = {
    keymap = {
      preset = 'none',

      -- Use Tab for: select next item -> move forward in snippet -> normal Tab (fallback)
      ['<Tab>'] = {
        function(cmp)
          if cmp.is_visible() then
            return cmp.select_next()
          end
        end,
        'snippet_forward',
        'fallback',
      },

      -- Use S-Tab for: select previous item -> move backward in snippet -> fallback
      ['<S-Tab>'] = {
        function(cmp)
          if cmp.is_visible() then
            return cmp.select_prev()
          end
        end,
        'snippet_backward',
        'fallback',
      },

      -- Use Enter to accept the selection; if menu is closed, it acts as a normal Enter
      ['<CR>'] = { 'accept', 'fallback' },

      -- Use Ctrl-Space to manually trigger completion (refresh)
      ['<C-space>'] = { 'show', 'show_documentation', 'hide_documentation' },
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
    fuzzy = { implementation = 'lua' },
    signature = { enabled = true },
  },
}
