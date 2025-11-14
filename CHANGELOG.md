# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-13

### Added
- Initial release
- Support for HiAnime streaming platform
- Dynamic anime poster image integration
- Episode and timestamp tracking
- Browser extension for Chromium-based browsers
- Flask server for Discord RPC communication
- Environment variable configuration system
- Comprehensive documentation and setup guides
- Configurable update intervals via `config.json` file (default: 5 seconds)
- Rate limiting to comply with Discord's API limits (5 updates per 20 seconds)
- Automatic reconnection handling for Discord IPC pipe errors
- Session-based continuous elapsed timer that persists across episodes and pauses

### Features
- Automatic detection of anime title and episode
- Server rate-limits Discord Rich Presence updates (configurable, default: 5 seconds)

### Fixed
- Discord Rich Presence timer no longer resets when seeking or changing episodes
- Server handles Discord disconnections gracefully and reconnects automatically
- Rate limiting prevents hitting Discord's API limits during continuous playback

## [Unreleased]

### Planned
- YouTube platform support
- Netflix platform support
- Crunchyroll platform support
- Additional streaming platform integrations
- Configuration UI for easier setup
- Multi-language support
