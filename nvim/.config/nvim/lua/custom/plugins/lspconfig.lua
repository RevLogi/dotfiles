return {
  'neovim/nvim-lspconfig',
  dependencies = {
    'mason-org/mason.nvim',
    'mason-org/mason-lspconfig.nvim',
    'WhoIsSethDaniel/mason-tool-installer.nvim',
    { 'j-hui/fidget.nvim', opts = {} },
    'saghen/blink.cmp',
  },
  config = function()
    local lsp_utils = require 'lsp.init'
    local platform = require 'custom.platform'

    local package_executables = {
      lua_ls = 'lua-language-server',
      ts_ls = 'typescript-language-server',
      jsonls = 'vscode-json-language-server',
      basedpyright = 'basedpyright-langserver',
      vimls = 'vim-language-server',
      openscad_lsp = 'openscad-lsp',
    }

    local function missing_packages(packages)
      local missing = {}
      for _, package in ipairs(packages) do
        local executable = package_executables[package] or package
        if vim.fn.executable(executable) == 0 then
          missing[#missing + 1] = package
        end
      end
      return missing
    end

    local servers = {
      'lua_ls',
      'ts_ls',
      'jsonls',
      'basedpyright',
      'ruff',
      'vimls',
      'clangd',
    }

    if vim.fn.executable 'openscad-lsp' == 1 or vim.fn.executable 'cargo' == 1 then
      servers[#servers + 1] = 'openscad_lsp'
    end

    if vim.fn.executable 'zls' == 1 then
      servers[#servers + 1] = 'zls'
    end

    local tools = {
      'stylua',
      'clang-format',
      'prettierd',
    }

    local mason_servers = missing_packages(servers)
    tools = missing_packages(tools)

    if platform.is_remote then
      mason_servers = missing_packages { 'lua_ls', 'clangd' }
      tools = missing_packages { 'stylua', 'clang-format' }
    end

    require('mason').setup {
      PATH = 'append',
      max_concurrent_installers = platform.is_remote and 2 or 4,
    }

    require('mason-tool-installer').setup { ensure_installed = tools }

    for _, server_name in ipairs(servers) do
      local config = {
        capabilities = lsp_utils.get_capabilities(),
      }
      local has_custom_config, custom_config = pcall(require, 'lsp.' .. server_name)
      if has_custom_config then
        config = vim.tbl_deep_extend('force', config, custom_config)
      end
      vim.lsp.config(server_name, config)
    end

    require('mason-lspconfig').setup {
      ensure_installed = mason_servers,
      automatic_enable = false,
    }

    vim.lsp.enable(servers)

    if platform.is_macos then
      require('lsp.sourcekit').setup()
    end
  end,
}
