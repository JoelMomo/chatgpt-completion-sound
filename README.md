<p align="center">
  <img src="icon128.png" width="128" alt="ChatGPT Completion Sound logo">
</p>

# ChatGPT Completion Sound

A lightweight Chrome/Edge extension that plays `potion.wav` when a ChatGPT response finishes and can show a silent Windows notification.

It tracks each ChatGPT tab independently, queues sounds if several chats finish close together, and ignores manual Stop/Cancel actions.

## Install

### Microsoft Edge

1. Download the latest ZIP from **Releases** and extract it.
2. Open `edge://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted folder — the one containing `manifest.json`.
6. Reload any ChatGPT tabs that were already open.

### Google Chrome

1. Download and extract the latest ZIP from **Releases**.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted folder containing `manifest.json`.
6. Reload any existing ChatGPT tabs.

## Usage

Click the extension icon to:

- enable or disable the completion sound;
- enable or disable completion notifications;
- change the sound volume;
- test the sound;
- test the notification.

Completion notifications are intentionally **silent**, so Windows does not play a second sound over `potion.wav`. Clicking a completion notification focuses the ChatGPT tab that finished.

## Privacy

The extension runs only on `https://chatgpt.com/*`. Its settings are stored locally in the browser. It does not send conversation data to an external server.

## Updating

Download the newer Release, replace the old extracted folder, then click **Reload** on the extension card in `edge://extensions/` or `chrome://extensions/`.

## Notes

This is an unpacked browser extension, so Developer mode must remain enabled. If ChatGPT changes its web interface, the completion detector may need an update.

## Support development

These projects are free to use and developed in my spare time. If they've been useful to you, you can support future development through [GitHub Sponsors](https://github.com/sponsors/JoelMomo) or leave a [one-time tip on Ko-fi](https://ko-fi.com/joelmomodev).

All projects remain free regardless of support.
