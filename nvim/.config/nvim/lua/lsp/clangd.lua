local lsp_utils = require 'lsp.init'

return {
  cmd = { 'clangd', '--background-index', '--header-insertion=iwyu' },
  capabilities = lsp_utils.get_capabilities(),
}
