return {
  'neovim/nvim-lspconfig',
  dependencies = {
    { 'mason-org/mason.nvim', opts = {} },
    'mason-org/mason-lspconfig.nvim',
    'WhoIsSethDaniel/mason-tool-installer.nvim',
    { 'j-hui/fidget.nvim', opts = {} },
    'saghen/blink.cmp',
  },
  config = function()
    local lsp_utils = require 'lsp.init'

    local servers = {
      'lua_ls',
      'ts_ls',
      'jsonls',
      'pyright',
      'vimls',
      'clangd',
    }

    local ensure_installed = vim.list_extend(servers, {
      'stylua',
      'typescript-language-server',
      'json-lsp',
      'vim-language-server',
      'clang-format',
    })

    require('mason-tool-installer').setup { ensure_installed = ensure_installed }

    require('mason-lspconfig').setup {
      ensure_installed = {},
      automatic_installation = false,
      handlers = {
        function(server_name)
          if vim.tbl_contains(servers, server_name) then
            vim.lsp.enable(server_name)
          end
        end,
      },
    }
  end,
}
