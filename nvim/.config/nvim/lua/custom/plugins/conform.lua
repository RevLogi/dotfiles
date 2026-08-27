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
        args = function(_, ctx)
          local project_config = vim.fs.find({ '.clang-format', '_clang-format' }, {
            path = vim.fs.dirname(ctx.filename),
            upward = true,
          })[1]
          local style = project_config and 'file' or 'file:' .. vim.fs.joinpath(vim.fn.stdpath 'config', '.clang-format')

          return { '--style=' .. style, '--assume-filename', '$FILENAME' }
        end,
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
