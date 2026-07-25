return {
  'nvim-treesitter/nvim-treesitter',
  lazy = false,
  build = ':TSUpdate',
  config = function()
    local platform = require 'custom.platform'
    local parsers = { 'bash', 'c', 'cpp', 'cuda', 'diff', 'html', 'lua', 'luadoc', 'markdown', 'markdown_inline', 'python', 'query', 'vim', 'vimdoc', 'zig' }
    local filetypes = { 'sh', 'c', 'cpp', 'cuda', 'diff', 'html', 'lua', 'markdown', 'python', 'query', 'vim', 'vimdoc', 'zig' }

    require('nvim-treesitter').install(parsers, {
      max_jobs = platform.is_remote and 2 or nil,
      summary = true,
    })

    vim.api.nvim_create_autocmd('FileType', {
      pattern = filetypes,
      callback = function()
        if pcall(vim.treesitter.start) then
          vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
        end
      end,
    })
  end,
}
