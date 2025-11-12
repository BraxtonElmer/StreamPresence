# Contributing to StreamPresence

Contributions to this project are welcome and appreciated.

## How to Contribute

### Adding Support for New Streaming Sites

To add support for a new streaming platform (YouTube, Netflix, Crunchyroll, etc.):

1. Create a new content script or modify the existing `content.js`
2. Implement detection logic for the following metadata:
   - Video/Show title
   - Episode/Season number (if applicable)
   - Current playback timestamp
   - Total duration
   - Poster/thumbnail URL
   - Page URL

3. Test thoroughly with multiple content types on the platform
4. Update the README.md with platform-specific information

### Code Structure for New Sites

```javascript
// In content.js or a new site-specific file
function getSiteNameInfo() {
  const title = // Extract title logic
  const episode = // Extract episode logic (if applicable)
  const poster = // Extract poster/thumbnail URL logic
  
  return { title, episode, poster };
}
```

## Reporting Bugs

When reporting bugs, include:
- Browser name and version
- Python version
- Streaming site URL where issue occurs
- Complete error messages or console logs
- Detailed steps to reproduce the issue

## Pull Request Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-site-support`)
3. Implement your changes
4. Test thoroughly with multiple scenarios
5. Commit with descriptive messages
6. Push to your fork
7. Open a Pull Request with detailed description

## Coding Standards

- Use descriptive variable and function names
- Add comments for complex logic
- Follow the existing code style and structure
- Test all changes before submitting

## Questions and Discussion

Open an issue for questions, suggestions, or general discussion about the project.
