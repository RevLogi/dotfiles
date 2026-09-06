local function check_version()
  local version = tostring(vim.version())
  if vim.fn.has 'nvim-0.12' == 1 then
    vim.health.ok('Neovim ' .. version)
  else
    vim.health.error('Neovim 0.12 or newer is required; found ' .. version)
  end
end

local function check_external_requirements()
  for _, executable in ipairs { 'git', 'make', 'unzip', 'rg' } do
    if vim.fn.executable(executable) == 1 then
      vim.health.ok('Found ' .. executable)
    else
      vim.health.warn('Could not find ' .. executable)
    end
  end
end

return {
  check = function()
    vim.health.start 'dotfiles'
    vim.health.info('System: ' .. vim.inspect(vim.uv.os_uname()))
    check_version()
    check_external_requirements()
  end,
}
