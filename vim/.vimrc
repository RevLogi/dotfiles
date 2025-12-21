" GENERAL SETTINGS
set nocompatible            " Disable Vi compatibility
filetype off                " Required for plugin managers
set encoding=utf-8          " Force UTF-8 encoding

" PLUGINS (Vim-Plug)
call plug#begin('~/.vim/plugged')

  " Core Utilities
  Plug 'bronson/vim-trailing-whitespace'  " Tools to clean whitespace
  Plug 'lifepillar/vim-solarized8'        " Theme
  Plug 'lambdalisue/vim-fern'             " File managers
  Plug 'jpalardy/vim-slime'
  Plug 'tpope/vim-surround'

  " Haskell Support
  Plug 'neovimhaskell/haskell-vim'        " Enhanced syntax highlighting
  Plug 'neoclide/coc.nvim', {'branch': 'release'} " LSP Client (Intellisense)

call plug#end()

" Indentation settings
filetype plugin indent on

" APPEARANCE & UI
syntax enable
set shortmess+=I            " Disable startup message
set number relativenumber   " Hybrid line numbering
set laststatus=2            " Always show status line
set colorcolumn=80          " Highlight 80th column (coding standard)

" Theme Configuration (Solarized)
function! DetectDarkModeMacOS()
    let l:theme = system('defaults read -g AppleInterfaceStyle 2>/dev/null')
    if l:theme =~ 'Dark'
        set background=dark
    else
        set background=light
    endif
endfunction

augroup DarkMode
    autocmd!
    autocmd VimEnter * call DetectDarkModeMacOS()
augroup END

set termguicolors
colorscheme solarized8


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

" Cursor configuration
let &t_SI = "\e[5 q"
let &t_SR = "\e[3 q"
let &t_EI = "\e[1 q"

augroup RestoreCursorShape
  autocmd!
  autocmd VimEnter * silent !echo -ne "\e[1 q"
augroup END

