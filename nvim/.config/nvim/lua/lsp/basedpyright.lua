local python_path
if vim.env.VIRTUAL_ENV then
  python_path = vim.fs.joinpath(vim.env.VIRTUAL_ENV, 'bin', 'python')
end

local root_markers = {
  'pyrightconfig.json',
  'pyproject.toml',
  'setup.py',
  'setup.cfg',
  'requirements.txt',
  'Pipfile',
  '.git',
}

return {
  root_dir = function(bufnr, on_dir)
    local root = vim.fs.root(bufnr, root_markers)
    if not root then
      local filename = vim.api.nvim_buf_get_name(bufnr)
      root = filename ~= '' and vim.fs.dirname(filename) or vim.fn.getcwd()
    end
    on_dir(root)
  end,
  settings = {
    python = {
      pythonPath = python_path,
    },
    basedpyright = {
      analysis = {
        diagnosticMode = 'openFilesOnly',
        typeCheckingMode = 'basic',
      },
    },
  },
}
