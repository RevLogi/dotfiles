local M = {}

local enabled = true

local function notify(message, level)
  vim.notify(message, level, { title = 'Auto-save' })
end

local function is_saveable(buf)
  return vim.api.nvim_buf_is_valid(buf)
    and vim.api.nvim_buf_is_loaded(buf)
    and vim.bo[buf].modified
    and vim.bo[buf].modifiable
    and vim.bo[buf].buftype == ''
    and vim.api.nvim_buf_get_name(buf) ~= ''
end

local function save(buf)
  if not enabled or not is_saveable(buf) then
    return
  end

  local ok, error_message = pcall(vim.api.nvim_buf_call, buf, function()
    -- Keep automatic persistence separate from the explicit :write pipeline.
    -- In particular, this must not invoke Conform's BufWritePre formatter.
    vim.cmd 'silent noautocmd update'
  end)

  if not ok then
    notify(('Could not save %s: %s'):format(vim.fn.fnamemodify(vim.api.nvim_buf_get_name(buf), ':~:.'), error_message), vim.log.levels.ERROR)
  end
end

local function set_enabled(value)
  enabled = value
  notify(enabled and 'Enabled' or 'Disabled', vim.log.levels.INFO)
end

function M.setup()
  local group = vim.api.nvim_create_augroup('custom-autosave', { clear = true })

  vim.api.nvim_create_autocmd('InsertLeave', {
    group = group,
    desc = 'Save modified ordinary files without running explicit-save hooks',
    callback = function(event)
      save(event.buf)
    end,
  })

  vim.api.nvim_create_user_command('AutoSaveEnable', function()
    set_enabled(true)
  end, { desc = 'Enable saving modified files on InsertLeave', force = true })

  vim.api.nvim_create_user_command('AutoSaveDisable', function()
    set_enabled(false)
  end, { desc = 'Disable saving modified files on InsertLeave', force = true })

  vim.api.nvim_create_user_command('AutoSaveToggle', function()
    set_enabled(not enabled)
  end, { desc = 'Toggle saving modified files on InsertLeave', force = true })

  vim.api.nvim_create_user_command('AutoSaveStatus', function()
    notify(enabled and 'Enabled' or 'Disabled', vim.log.levels.INFO)
  end, { desc = 'Show whether InsertLeave auto-save is enabled', force = true })
end

return M
