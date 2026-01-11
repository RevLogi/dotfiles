return {
  'catppuccin/nvim',
  name = 'catppuccin',
  priority = 1000,
  opts = {
    flavour = 'auto',
    background = {
      light = 'latte',
      dark = 'mocha',
    },
  },
  init = function()
    vim.cmd.colorscheme 'catppuccin'
  end,
}
