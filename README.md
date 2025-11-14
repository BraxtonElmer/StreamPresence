# StreamPresence - Discord Rich Presence for Streaming

A lightweight Discord Rich Presence client that displays real-time streaming activity. Shows titles, episode numbers, timestamps, and dynamic poster images in your Discord profile.

![Discord Rich Presence](https://img.shields.io/badge/Discord-Rich_Presence-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Features

- Real-time playback tracking with configurable update intervals
- Dynamic poster images pulled directly from streaming sites
- Episode and timestamp tracking with automatic detection
- Clickable links in presence for direct episode access
- Automatic content detection with no manual input required

## Supported Platforms

### Currently Supported
- HiAnime (hianime.to / hianime.do)

### Planned Support
- YouTube
- Netflix
- Crunchyroll
- Additional streaming platforms

## Requirements

- Python 3.8 or higher
- Discord Desktop Application
- Chromium-based browser (Chrome, Edge, Brave, Opera)
- Discord Developer Application credentials

## Quick Start

Follow these steps to get up and running in minutes.

### 1. Get Discord Application Credentials

1. Navigate to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and provide a name (e.g., "Watching")
3. Copy the Application ID from the General Information page

### 2. Download and Configure

```bash
# Clone the repository
git clone https://github.com/BraxtonElmer/StreamPresence.git
cd StreamPresence
```

Create a `.env` file in the project root:
```env
DISCORD_CLIENT_ID=your_application_id_here
FLASK_PORT=8731
FLASK_HOST=127.0.0.1
LARGE_IMAGE_KEY=
```

### 3. Run Quick Start Script

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

The script will automatically:
- Create a virtual environment
- Install all dependencies
- Start the Flask server

### 4. Install Browser Extension

1. Open `chrome://extensions/` in your browser
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `plugin` folder from the project directory

### 5. Start Streaming

1. Ensure Discord Desktop is running
2. Navigate to a supported streaming site (e.g., HiAnime)
3. Start playing content
4. Check your Discord profile for the updated presence

---

## Manual Installation

For users who prefer manual setup or need more control over the installation process.

### Step 1: Create Discord Application

1. Navigate to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and provide a name
3. Copy the Application ID from the General Information page
4. Optional: Upload custom images under Rich Presence > Art Assets

### Step 2: Clone Repository

```bash
git clone https://github.com/BraxtonElmer/StreamPresence.git
cd StreamPresence
```

### Step 3: Set Up Python Environment

Create a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment

Create a `.env` file in the project root with the following content:
```env
DISCORD_CLIENT_ID=your_application_id_here
FLASK_PORT=8731
FLASK_HOST=127.0.0.1
LARGE_IMAGE_KEY=
```

### Step 5: Install Browser Extension

1. Navigate to `chrome://extensions/` in your browser
2. Enable "Developer mode" using the toggle in the top-right
3. Click "Load unpacked"
4. Select the `plugin` folder from the project directory
5. Verify the extension appears in your extensions list

### Step 6: Start the Server

```bash
cd python
python app.py
```

Expected output:
```
Discord Rich Presence Server running on 127.0.0.1:8731
Watching for activity from browser extension...
```

### Step 7: Verify Functionality

1. Ensure Discord Desktop is running
2. Navigate to a supported streaming site
3. Begin playback of any content
4. Check your Discord profile for updated presence information

---

## How It Works

The system operates in three stages:

1. **Browser Extension**: Detects and extracts content metadata (title, episode, timestamp) from web pages
2. **Flask Server**: Receives HTTP POST requests containing metadata from the browser extension
3. **Discord RPC**: Updates your Discord Rich Presence using the pypresence library via IPC

```
Browser Extension  -->  Flask Server  -->  Discord RPC
    (HTTP POST)           (Python)          (IPC)
```

## Project Structure

```
StreamPresence/
├── plugin/                 # Browser extension
│   ├── manifest.json       # Extension metadata
│   ├── content.js         # Content detection script
│   └── background.js      # Background service worker
├── python/                # Backend server
│   └── app.py            # Flask application
├── .env                  # Environment configuration (required)
├── config.json           # Application settings (optional)
├── .gitignore           # Git exclusions
├── LICENSE              # MIT License
├── README.md           # Documentation
├── requirements.txt    # Python dependencies
├── start.bat          # Windows launcher
└── start.sh          # Unix launcher
```

## Configuration Options

### Environment Variables (`.env`)

**Required:**
```env
DISCORD_CLIENT_ID=your_application_id_here
```

**Optional:**
```env
FLASK_PORT=8731          # Server port (default: 8731)
FLASK_HOST=127.0.0.1     # Server host (default: 127.0.0.1)
LARGE_IMAGE_KEY=         # Static Discord asset key (leave empty for dynamic images)
```

### Application Settings (`config.json`)

The included `config.json` file allows you to customize application behavior:

```json
{
  "update_interval": 5
}
```

**Available Settings:**

- `update_interval` (number): Seconds between Discord Rich Presence updates
  - **Default:** 5 seconds
  - **Recommended:** 5-15 seconds to avoid Discord's rate limit (5 updates per 20 seconds)
  - **Note:** The browser extension sends data every 1 second; the server rate-limits outgoing updates based on this setting

Edit `config.json` and restart the server to apply changes.

## Troubleshooting

### Rich Presence Not Displaying

- Verify Discord Desktop application is running (web version not supported)
- Confirm Flask server is running without errors
- Check that the Client ID in `.env` matches your Discord Application
- Restart Discord completely

### Browser Extension Issues

- Reload the extension at `chrome://extensions/`
- Refresh the streaming site page
- Check browser console (F12) for error messages
- Verify extension permissions are granted

### Extension Context Errors

When you see "Extension context invalidated":
- This occurs when reloading the extension while pages are open
- Refresh all streaming site tabs to resolve

### Server Connection Failures

- Verify `.env` file exists and contains valid credentials
- Check that port 8731 is not in use by another application
- Ensure firewall is not blocking local connections

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Adding support for new streaming platforms
- Improving content detection algorithms
- Bug fixes and performance improvements
- Documentation enhancements

### Adding New Platform Support

1. Modify `content.js` in the `plugin` folder or create a new content script
2. Implement detection for: title, episode, timestamp, duration, poster URL
3. Test thoroughly across different content types
4. Update documentation with platform-specific notes

## Development

### Running in Development Mode

```bash
# Install development dependencies
pip install -r requirements.txt

# Start server with debug mode
cd python
python app.py
```

### Testing Browser Extension

1. Make changes to extension files in the `plugin` folder
2. Reload extension at `chrome://extensions/`
3. Refresh test pages
4. Verify functionality

## Security Notes

- Never commit your `.env` file to version control
- The `.gitignore` file excludes `.env` by default
- Keep your Discord Application credentials private
- Review extension permissions before installation

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Disclaimer

This project is intended for educational purposes. Respect the terms of service of all streaming platforms you use.

## Technical Stack

- **Backend**: Flask (Python web framework)
- **RPC Library**: pypresence (Discord Rich Presence implementation)
- **Extension**: Manifest V3 Chrome Extension
- **Configuration**: python-dotenv for environment management

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

## Support

For bug reports and feature requests, open an issue on GitHub with:
- Browser name and version
- Python version
- Streaming platform URL
- Error messages or console output
- Steps to reproduce the issue

---