" ═══════════════════════════════════════════════════════════════
" MINIMAL VIM CONFIGURATION
" ═══════════════════════════════════════════════════════════════
"
" This is a minimal Vim configuration for occasional use.
" Primary editor: Neovim (see nvim/.config/nvim/)
"
" Features:
" - Basic utility plugins (whitespace, slime, surround)
" - Hard mode (no arrow keys)
" - Auto-save
"
" Removed:
" - LSP functionality (coc.nvim and all related config)
" - File manager (vim-fern)
" - Theme (solarized8)
" - Haskell-specific syntax highlighting
"

set nocompatible            " Disable Vi compatibility
filetype off                " Required for plugin managers
set encoding=utf-8          " Force UTF-8 encoding

" PLUGINS (Vim-Plug)
call plug#begin('~/.vim/plugged')

  " Core Utilities
  Plug 'bronson/vim-trailing-whitespace'  " Tools to clean whitespace
  Plug 'jpalardy/vim-slime'             " Code execution in tmux
  Plug 'tpope/vim-surround'

call plug#end()

" Indentation settings
filetype plugin indent on

" APPEARANCE & UI
syntax enable
set shortmess+=I            " Disable startup message
set number relativenumber   " Hybrid line numbering
set laststatus=2            " Always show status line
set colorcolumn=80          " Highlight 80th column (coding standard)

" BEHAVIOR
set backspace=indent,eol,start " Allow backspacing over everything
set hidden                     " Allow switching buffers without saving
set incsearch                  " Search as you type
set ignorecase smartcase       " Case-insensitive search unless caps used
set noerrorbells visualbell t_vb= " Disable audio bell
set mouse+=a                   " Enable mouse support

" Unbind 'Q' (Ex mode)
nmap Q <Nop>

" --- HARD MODE: Disable Arrow Keys ---
" Force yourself to use h/j/k/l
nnoremap <Left>  :echoe "Use h"<CR>
nnoremap <Right> :echoe "Use l"<CR>
nnoremap <Up>    :echoe "Use k"<CR>
nnoremap <Down>  :echoe "Use j"<CR>
inoremap <Left>  <ESC>:echoe "Use h"<CR>
inoremap <Right> <ESC>:echoe "Use l"<CR>
inoremap <Up>    <ESC>:echoe "Use k"<CR>
inoremap <Down>  <ESC>:echoe "Use j"<CR>

" Vim slime configuration
let g:slime_target = "tmux"

" Auto save
autocmd TextChanged,TextChangedI <buffer> silent write

