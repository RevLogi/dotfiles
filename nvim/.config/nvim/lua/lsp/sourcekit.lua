local lsp_utils = require 'lsp.init'

local function setup()
  if vim.fn.executable 'xcrun' ~= 1 then
    return
  end

  local function start_lsp()
    local buf = vim.api.nvim_get_current_buf()
    local fname = vim.api.nvim_buf_get_name(buf)
    local root = vim.fs.root(buf, { 'Package.swift' })
    local fallback = vim.fn.fnamemodify(fname, ':p:h')

    vim.lsp.start({
      name = 'sourcekit',
      cmd = { 'xcrun', 'sourcekit-lsp' },
      root_dir = root or fallback,
      capabilities = lsp_utils.get_capabilities(),
    }, { bufnr = buf })
  end

  vim.api.nvim_create_autocmd('FileType', {
    pattern = { 'swift', 'objc', 'objcpp' },
    callback = start_lsp,
  })

  if vim.tbl_contains({ 'swift', 'objc', 'objcpp' }, vim.bo.filetype) then
    start_lsp()
  end
end

return { setup = setup }
