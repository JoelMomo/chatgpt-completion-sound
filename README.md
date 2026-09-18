<p align="center">
  <img src="icon128.png" width="128" alt="ChatGPT Completion Sound logo">
</p>

# ChatGPT Completion Sound

[![Latest release](https://img.shields.io/github/v/release/JoelMomo/chatgpt-completion-sound?style=flat-square)](https://github.com/JoelMomo/chatgpt-completion-sound/releases) [![Apps & tools](https://img.shields.io/badge/Apps%20%26%20tools-Browse-6F8F72?style=flat-square)](https://joelmomo.github.io/)

A lightweight Chrome/Edge extension that alerts you when a ChatGPT response finishes.

It tracks each ChatGPT tab independently, queues custom sounds if several chats finish close together, and ignores manual Stop/Cancel actions.

## Alert sounds

The extension includes:

- **Pop** - default
- **Cash Register**
- **Chan**
- **Potion**
- **Point**
- **Page Turn**
- **Windows notifications** - uses the standard Windows notification sound instead of a bundled WAV

When a bundled sound is selected, the Windows completion notification remains visible but silent so the two sounds do not overlap.

## Install

### Microsoft Edge

1. Download the latest ZIP from **Releases** and extract it.
2. Open `edge://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted folder containing `manifest.json`.
6. Reload any ChatGPT tabs that were already open.

### Google Chrome

1. Download and extract the latest ZIP from **Releases**.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted folder containing `manifest.json`.
6. Reload any existing ChatGPT tabs.

## Usage

Click the extension icon, choose an alert sound, set the volume and use **Test alert** to preview it.

The **Support** button opens the project's support page, where you can use GitHub Sponsors or Ko-fi.

Clicking a completion notification focuses the ChatGPT tab that finished.

## Privacy

The extension runs only on `https://chatgpt.com/*`. Its settings are stored locally in the browser. It does not send conversation data to an external server.

## Updating

Download the newer Release, replace the old extracted folder, then click **Reload** on the extension card in `edge://extensions/` or `chrome://extensions/`.

## Notes

This is an unpacked browser extension, so Developer mode must remain enabled. If ChatGPT changes its web interface, the completion detector may need an update.

## Contributing

Bug reports, feature ideas and focused pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) before opening one.

For security or privacy-sensitive reports, follow [SECURITY.md](SECURITY.md) instead of posting details publicly.

<div align="center">

## Support development

These projects are free to use and developed in my spare time. If they've been useful to you, you can help support future development.

<p>
  <a href="https://github.com/sponsors/JoelMomo">
    <img src="https://img.shields.io/badge/GitHub%20Sponsors-Sponsor-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Sponsor on GitHub">
  </a>
  <a href="https://ko-fi.com/joelmomodev">
    <img src="https://img.shields.io/badge/Ko--fi-One--time%20tip-FF5E5B?style=for-the-badge&logo=kofi&logoColor=white" alt="Leave a tip on Ko-fi">
  </a>
</p>

<sub>All projects remain free regardless of support.</sub>

</div>
