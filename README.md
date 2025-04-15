# Terminal Speed Test

A retro terminal-style internet speed test tool that helps users test their internet speed through an old-school command-line interface.

![Terminal Speed Test](https://i.imgur.com/example.png)

## Features

- 🖥️ Authentic 1970s terminal look with black background and green text
- 📊 Test download and upload speeds
- 📡 Measure latency and jitter
- 📝 Command history with up/down arrow navigation
- 📋 Detailed test results in ASCII table format
- 💾 Full terminal experience with command input and blinking cursor

## Available Commands

- `help` - Display available commands
- `speedtest` - Run a full internet speed test
  - Options:
    - `--download` - Test download speed only
    - `--upload` - Test upload speed only
    - `--full` - Test all metrics (default)
- `clear` or `cls` - Clear the terminal screen
- `about` - Display information about the application
- `history` - Show command history

## How to Use

1. Open the application in a web browser
2. Click anywhere in the terminal to focus
3. Type `speedtest` and press Enter to run a full speed test
4. View your results in the terminal output

## Technical Information

This is a client-side application that simulates internet speed tests. It provides realistic-looking results but does not perform actual network speed measurements.

## Development

Built with TypeScript and Vite.