# KDE Plasma Workflow

This workstation uses Plasma 6 on Wayland with KWin's native custom tiling.
The current layout has three columns at 25%, 50%, and 25% with 4 px gaps.
System-wide keyboard remaps are documented in [`KEYBOARD.md`](KEYBOARD.md).

## Packages

Install the KWin-native window control utility:

```bash
sudo dnf install kdotool
```

Deploy the KDE helpers and refresh Plasma's application database:

```bash
cd ~/Developer/dotfiles
stow -t ~ kde
kbuildsycoca6
```

## App Shortcuts

| Shortcut | Action |
|----------|--------|
| `Meta+S` | Focus Firefox, or launch it when absent |
| `Meta+K` | Focus Kitty, or launch it when absent |

The hidden desktop entries register the shortcuts with KGlobalAccel. The
`focus-or-launch` helper uses `kdotool`, so focusing works natively under KWin
on Wayland and follows a window to another virtual desktop.

## Tiling And Workspaces

KWin has four virtual desktops: **Dev**, **Web**, **Comms**, and **Misc**. Each
is an independent workspace with the same three-column tile layout. Use
`Meta+G` to see all four desktops and drag windows between them.

| Shortcut | Action |
|----------|--------|
| `Meta+T` | Edit the custom tile layout |
| `Meta+Arrow` | Quick-tile the active window |
| `Meta+Shift+H/J/K/L` | Move the active window to the custom tile left/down/up/right |
| `Meta+Alt+Arrow` | Focus the neighboring window |
| `Meta+Ctrl+1..4` | Switch directly to desktop 1..4 |
| `Meta+Ctrl+Shift+1..4` | Move the active window to desktop 1..4 |
| `Meta+W` | Toggle Overview |
| `Meta+G` | Toggle Desktop Grid |

KWin runtime files such as `~/.config/kwinrc`, `kwinrulesrc`, and
`kglobalshortcutsrc` remain machine-local because they contain output IDs and
other session-generated state.
