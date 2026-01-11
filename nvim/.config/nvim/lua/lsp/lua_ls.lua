local lsp_utils = require 'lsp.init'

return {
  settings = {
    Lua = {
      completion = {
        callSnippet = 'Replace',
      },
    },
  },
  capabilities = lsp_utils.get_capabilities(),
}
