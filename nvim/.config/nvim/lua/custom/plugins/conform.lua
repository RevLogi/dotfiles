return {
  'stevearc/conform.nvim',
  event = { 'BufWritePre' },
  cmd = { 'ConformInfo' },
  keys = {
    {
      '<leader>f',
      function()
        require('conform').format { async = true, timeout_ms = 3000, lsp_format = 'never' }
      end,
      mode = '',
      desc = '[F]ormat buffer',
    },
  },
  opts = {
    notify_on_error = true,
    notify_no_formatters = false,
    format_on_save = function(bufnr)
      return {
        timeout_ms = 3000,
        lsp_format = 'never',
      }
    end,
    formatters = {
      ['clang-format'] = {
        command = 'clang-format',
        args = {
          '--style=file',
          '--fallback-style=Google',
          '--assume-filename',
          '$FILENAME',
        },
        stdin = true,
      },
    },
    formatters_by_ft = {
      lua = { 'stylua' },
      python = { 'ruff_format' },
      c = { 'clang-format' },
      cpp = { 'clang-format' },
      cuda = { 'clang-format' },
      zig = { 'zigfmt' },
      swift = { 'swiftformat' },
      javascript = { 'prettierd' },
      javascriptreact = { 'prettierd' },
      typescript = { 'prettierd' },
      typescriptreact = { 'prettierd' },
      json = { 'prettierd' },
      css = { 'prettierd' },
      html = { 'prettierd' },
    },
  },
}
