# Tab Hibernator Chrome Extension

A Chrome extension that automatically hibernates inactive tabs after 5 minutes and provides a button to manually hibernate all tabs except the current one.

## Features

- **Auto-hibernation**: Automatically hibernates tabs after a configurable period of inactivity (default: 5 minutes)
- **Manual hibernation**: Button to hibernate all tabs except the current one
- **Customizable settings**:
  - Enable/disable auto-hibernation
  - Configure hibernation delay (1, 3, 5, 10, 15, or 30 minutes)
  - Exclude pinned tabs from hibernation
  - Exclude tabs playing audio from hibernation
- **Resource savings**: Displays estimated memory saved by hibernating tabs
- **Visual indicators**: Badge showing number of hibernated tabs
- **Smooth restoration**: Easy one-click restoration of hibernated tabs

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The Tab Hibernator extension should now be installed and active

## Usage

- **Auto-hibernation**: By default, tabs will be hibernated after 5 minutes of inactivity
- **Manual hibernation**: Click the extension icon and press "Hibernate All Tabs" to hibernate all tabs except the current one
- **Settings**: Configure hibernation preferences in the extension popup
- **Restoring tabs**: Click the "Restore Tab" button on any hibernated tab to restore it

## How It Works

The extension tracks tab activity and replaces inactive tab content with a lightweight placeholder page, significantly reducing memory and CPU usage. When you return to a hibernated tab, it's automatically restored to its original state.

## Icon Credits

You'll need to create icon files for the extension. You can use free icon generators or create your own icons.