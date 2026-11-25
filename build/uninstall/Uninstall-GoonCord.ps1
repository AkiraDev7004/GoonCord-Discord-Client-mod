# GoonCord uninstaller
# Removes GoonCord for the current Windows user. Vesktop / Vencord are NOT touched
# (except for files that are shared inside an old GoonCord install folder, see below).
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File Uninstall-GoonCord.ps1
#   powershell -ExecutionPolicy Bypass -File Uninstall-GoonCord.ps1 -Force -RemoveUserData

param(
    [switch]$Force,           # do not ask for confirmation
    [switch]$RemoveUserData   # also delete GoonCord settings, login cache and logs
)

$ErrorActionPreference = "Stop"

$installDirs = @(
    (Join-Path $env:LOCALAPPDATA "Programs\GoonCord"),
    # Older GoonCord builds were installed into the Vesktop folder (shared with Vesktop)
    (Join-Path $env:LOCALAPPDATA "vesktop")
)
$userDataDirs = @(
    (Join-Path $env:APPDATA "gooncord"),
    (Join-Path $env:LOCALAPPDATA "gooncord")
)
$shortcuts = @(
    (Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\GoonCord.lnk"),
    (Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\GoonCord"),
    (Join-Path ([Environment]::GetFolderPath("Desktop")) "GoonCord.lnk")
)

function Write-Step($text) { Write-Host "==> $text" -ForegroundColor Cyan }

# Collect what is actually installed
$found = @()
foreach ($dir in $installDirs) {
    if (Test-Path (Join-Path $dir "gooncord.exe")) { $found += $dir }
}
$userDataFound = @($userDataDirs | Where-Object { Test-Path $_ })
$shortcutsFound = @($shortcuts | Where-Object { Test-Path $_ })
$regKeys = @()
foreach ($root in @("HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall", "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall")) {
    if (Test-Path $root) {
        $regKeys += Get-ChildItem $root -ErrorAction SilentlyContinue | Where-Object {
            (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DisplayName -like "GoonCord*"
        }
    }
}

if ($found.Count -eq 0 -and $shortcutsFound.Count -eq 0 -and $regKeys.Count -eq 0 -and $userDataFound.Count -eq 0) {
    Write-Host "GoonCord is not installed for this user. Nothing to do." -ForegroundColor Yellow
    exit 0
}

Write-Host "GoonCord will be removed:"
foreach ($d in $found) { Write-Host "  - Install folder: $d" }
foreach ($s in $shortcutsFound) { Write-Host "  - Shortcut: $s" }
foreach ($k in $regKeys) { Write-Host "  - Uninstall entry: $($k.PSChildName)" }
if ($userDataFound.Count -gt 0) {
    Write-Host "  - User data (only if you confirm): $($userDataFound -join ', ')"
}

if (-not $Force) {
    $answer = Read-Host "Continue? (y/n)"
    if ($answer -notmatch '^(y|j)') {
        Write-Host "Cancelled."
        exit 0
    }
}

# 1. Close GoonCord (not Vesktop / Vencord)
Write-Step "Closing GoonCord"
Get-Process -Name "gooncord" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 800

# 2. Install folders
foreach ($dir in $found) {
    Write-Step "Removing files from $dir"
    if (Test-Path (Join-Path $dir "vesktop.exe")) {
        # Vesktop shares this folder: only remove the GoonCord-specific files
        Remove-Item (Join-Path $dir "gooncord.exe") -Force -ErrorAction SilentlyContinue
        Get-ChildItem $dir -Filter "Uninstall gooncord*.exe" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Host "  Vesktop is installed in this folder too, so the shared files were kept." -ForegroundColor Yellow
        Write-Host "  If Vesktop does not start anymore, reinstall Vesktop." -ForegroundColor Yellow
    } else {
        Remove-Item $dir -Recurse -Force
    }
}

# 3. Shortcuts
foreach ($s in $shortcutsFound) {
    Write-Step "Removing shortcut $s"
    Remove-Item $s -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Uninstall entries (Settings > Apps)
foreach ($k in $regKeys) {
    Write-Step "Removing uninstall entry $($k.PSChildName)"
    Remove-Item $k.PSPath -Recurse -Force -ErrorAction SilentlyContinue
}

# 5. User data
if ($userDataFound.Count -gt 0) {
    $removeData = $RemoveUserData
    if (-not $RemoveUserData -and -not $Force) {
        $answer = Read-Host "Also delete GoonCord settings, logs and login cache? (y/n)"
        $removeData = ($answer -match '^(y|j)')
    }
    if ($removeData) {
        foreach ($d in $userDataFound) {
            Write-Step "Removing user data $d"
            Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "User data was kept."
    }
}

Write-Host ""
Write-Host "GoonCord was removed." -ForegroundColor Green
