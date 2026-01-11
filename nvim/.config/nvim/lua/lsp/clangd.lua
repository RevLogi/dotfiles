local lsp_utils = require 'lsp.init'

return {
  cmd = { 'clangd', '--background-index' },
  capabilities = lsp_utils.get_capabilities(),
}
