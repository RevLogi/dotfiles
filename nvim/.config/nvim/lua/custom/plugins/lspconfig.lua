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

    local mason_servers = vim.deepcopy(servers)
    if vim.fn.executable 'zls' == 1 then
      servers[#servers + 1] = 'zls'
    end

    local tools = {
      'stylua',
      'clang-format',
      'prettierd',
    }

    -- Prefer Homebrew-managed binaries when available; Mason only installs the rest.
    local brew_servers = {
      clangd = 'clangd',
      basedpyright = 'basedpyright-langserver',
      ruff = 'ruff',
    }
    for server_name, executable in pairs(brew_servers) do
      if vim.fn.executable(executable) == 1 then
        for index, name in ipairs(mason_servers) do
          if name == server_name then
            table.remove(mason_servers, index)
            break
          end
        end
      end
    end

    if platform.is_remote then
      mason_servers = {}
      tools = {}

      if vim.fn.executable 'lua-language-server' == 0 then
        mason_servers[#mason_servers + 1] = 'lua_ls'
      end
      if vim.fn.executable 'clangd' == 0 then
        mason_servers[#mason_servers + 1] = 'clangd'
      end
      if vim.fn.executable 'stylua' == 0 then
        tools[#tools + 1] = 'stylua'
      end
      if vim.fn.executable 'clang-format' == 0 then
        tools[#tools + 1] = 'clang-format'
      end
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
