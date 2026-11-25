# GoonCord

GoonCord is a custom Discord desktop client, based on [Vesktop](https://github.com/Vencord/Vesktop) and with [Vencord](https://github.com/Vendicated/Vencord) preinstalled.

**Features**:

- Vencord preinstalled, with its own settings, plugins and QuickCSS
- OLED Black theme by default
- Automatic updates from this repository's GitHub releases
- Much lighter and faster than the official Discord app
- Linux screenshare with sound & Wayland support
- Better privacy, since Discord has no direct access to your system
- Global keybinds, including push to talk (see [Global Keybinds](#global-keybinds))
- Runs side by side with Vesktop and Vencord, since it has its own app ID and data folder

## Downloads

Get the latest version from the [Releases](https://github.com/AkiraDev7004/GoonCord-Discord-Client-mod/releases) page:

| Platform            | File                                    |
| ------------------- | --------------------------------------- |
| Windows (installer) | `GoonCord Setup x.y.z.exe`              |
| Windows (portable)  | `GoonCord-x.y.z-win.zip` (x64 or arm64) |
| Linux (any distro)  | `GoonCord-x.y.z.AppImage`               |
| Linux (archive)     | `gooncord-x.y.z.tar.gz`                 |
| macOS               | `.dmg` / `.zip`                         |

Once installed, GoonCord checks for updates when it starts and then every 6 hours. When an update is ready you can install it from the updater window. You can also choose to ignore an update or be reminded a day later.

## Uninstalling (Windows)

Uninstall GoonCord from **Settings > Apps**, or run the uninstaller script that ships with the Windows build:

```powershell
powershell -ExecutionPolicy Bypass -File Uninstall-GoonCord.ps1
```

The script closes GoonCord, removes its install folder, shortcuts and uninstall entry, and asks before deleting your settings. Vesktop and Vencord are not touched.

## Global Keybinds

Configure them in the GoonCord settings, or from Discord's Keybinds and Voice & Video settings.

- **Windows, Linux (X11)**: Bind any keys or mouse buttons in the GoonCord keybind settings
- **macOS**: Same as above, but GoonCord needs the Accessibility permission
- **Linux (Wayland)**: Wayland doesn't let apps listen to global input. Enable global shortcuts in the GoonCord keybind settings and assign them in your system settings. This needs a desktop that supports the GlobalShortcuts portal, such as GNOME or KDE

You can also trigger actions from other programs, for example your compositor's keybinds:

```sh
gooncord --run-shortcut toggleMute
# Append :down or :up to only press or release, e.g. for push to talk
gooncord --run-shortcut pushToTalk:down
gooncord --run-shortcut pushToTalk:up
```

For lower latency, send the same commands as lines to the socket at `$XDG_RUNTIME_DIR/vesktop.sock`:

```sh
echo "run-shortcut pushToTalk:down" | socat - UNIX-CONNECT:$XDG_RUNTIME_DIR/vesktop.sock
```

Run `gooncord --help` to see all actions.

## Building from Source

You need:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download) 22 or newer
- pnpm: `npm install --global pnpm`

```sh
git clone https://github.com/AkiraDev7004/GoonCord-Discord-Client-mod
cd GoonCord-Discord-Client-mod

# Install dependencies
pnpm i

# Run without packaging
pnpm start

# Package for your OS (builds go to ../Build)
pnpm package

# Or package to a directory only
pnpm package:dir
```

Checks used by CI:

```sh
pnpm test        # lint, format check and type check
pnpm build       # production build
pnpm build --dev # development build
```

## Releases and Auto-Update

Releases are built by the `Release` workflow. It runs when a tag starting with `v` is pushed:

```sh
git tag v1.7.1
git push origin v1.7.1
```

The workflow builds Windows, Linux and macOS and attaches the files to a GitHub release. Installed copies of GoonCord look for a newer release of this repository, so the version in `package.json` must be higher than the installed one.

## Building LibVesktop from Source

LibVesktop is a small C++ helper library used on Linux to send D-Bus events. By default, prebuilt binaries for x64 and arm64 are used. To build it yourself:

1. Install the build dependencies:
    - Debian/Ubuntu: `apt install build-essential python3 curl pkg-config libglib2.0-dev`
    - Fedora: `dnf install @c-development @development-tools python3 curl pkgconf-pkg-config glib2-devel`
2. Run `pnpm buildLibVesktop`
3. From then on, builds use your own library.

## Credits

GoonCord is built on [Vesktop](https://github.com/Vencord/Vesktop) and [Vencord](https://github.com/Vendicated/Vencord). Both are licensed under GPL-3.0-or-later, and so is GoonCord (see [LICENSE](LICENSE)). The original copyright notices are kept in the source files.
