return {
  'olimorris/codecompanion.nvim',
  version = '^19.0.0',
  cmd = {
    'CodeCompanionActions',
    'CodeCompanionChat',
  },
  dependencies = {
    'nvim-lua/plenary.nvim',
    'nvim-treesitter/nvim-treesitter',
    {
      'MeanderingProgrammer/render-markdown.nvim',
      ft = { 'markdown', 'codecompanion' },
      opts = {
        file_types = { 'markdown', 'codecompanion' },
      },
    },
  },
  keys = {
    { '<leader>aa', '<cmd>CodeCompanionActions<cr>', mode = { 'n', 'v' }, desc = '[A]I [A]ctions' },
    { '<leader>ac', '<cmd>CodeCompanionChat Toggle<cr>', desc = '[A]I [C]hat' },
    { '<leader>ac', '<cmd>CodeCompanionChat Add<cr>', mode = 'v', desc = '[A]dd selection to AI [C]hat' },
    { '<leader>ax', '<cmd>CodeCompanionChat Changes<cr>', desc = '[A]I changed files' },
  },
  opts = {
    adapters = {
      acp = {
        codex = function()
          return require('codecompanion.adapters').extend('codex', {
            commands = {
              default = { 'npx', '-y', '@agentclientprotocol/codex-acp@1.4.0' },
            },
            defaults = {
              auth_method = 'chat-gpt',
            },
          })
        end,
      },
    },
    interactions = {
      chat = {
        adapter = 'codex',
      },
    },
    display = {
      chat = {
        window = {
          layout = 'vertical',
          position = 'right',
          width = 0.38,
        },
      },
    },
  },
}
