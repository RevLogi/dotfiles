# Keyboard Remapping

Karabiner-Elements provides the macOS profile. Fedora uses Input Remapper so
the same core behavior works under KDE Wayland and virtual consoles.

## Fedora Mappings

The `default` preset is applied to both `Keychron Keychron K15 Max` and
`2.4G Wireless`.

| Input | Output |
|-------|--------|
| Tap `Caps Lock` | `Escape` |
| Hold `Caps Lock` with another key | Left Control |
| Left Control+`H/J/K/L` | Left/Down/Up/Right |
| Right Meta | Left Alt |
| Right Alt | Linux function layer |
| Right Alt+`F6` | KDE Desktop Grid (`Meta+G`) |
| Right Alt+`F9/F10` | Brightness down/up |
| Right Alt+`F11/F12` | Volume down/up |

Linux cannot synthesize Apple's hardware `Fn` event, so Right Alt activates
the concrete function mappings above instead.

## Installation

```bash
sudo dnf install input-remapper
sudo systemctl enable --now input-remapper
cd ~/Developer/dotfiles
stow -t ~ input-remapper
input-remapper-control --symbol-names >/dev/null
input-remapper-control --command autoload
```

The Keychron reports a trailing space in its evdev name. The Stow package
contains a compatibility symlink for that exact name so autoload and reconnects
resolve the canonical Keychron preset.

Input Remapper may print a Pydantic compatibility warning on Fedora's current
Python version. The packaged service and both presets still validate and run.

## Recovery

Stop all active mappings without disabling the service:

```bash
input-remapper-control --command stop-all
```

Stop the system service to restore raw keyboard behavior immediately:

```bash
sudo systemctl stop input-remapper
```

Restart and reload the configured presets:

```bash
sudo systemctl restart input-remapper
input-remapper-control --command autoload
```
