# PlaylistsM3u - M3U IPTV Playlist Player

A modern, mobile-optimized web application for playing M3U IPTV playlists with a TikTok-like interface. Built with React, Vite, and TailwindCSS.

## Features

- 🎬 **M3U Playlist Support** - Load and parse M3U/M3U8 playlists from any URL
- 📱 **Mobile-First Design** - TikTok-like interface optimized for mobile devices
- 🎮 **CDN Player Integration** - Uses CDN Player JS with automatic fallback sources:
  - Primary: `github.com/OinkTechLtd/cdnplayerjs`
  - Backup 1: `github.com/OinkTechLLC/cdnplayerjs`
  - Backup 2: `github.com/Twixoffltdco/cdnplayerjs`
- 🔒 **Content Restrictions** - Configurable channel restrictions based on regional regulations
- 📋 **Terms & Privacy** - Built-in terms of use, privacy policy, FAQ, and documentation
- 🔗 **Embed Support** - Generate embed codes to integrate the player on other websites
- ⚡ **Fast & Lightweight** - Built with Vite for optimal performance
- 🎨 **Dark Theme** - Modern dark UI inspired by popular streaming apps

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: TailwindCSS 4
- **Player**: CDN Player JS (with fallbacks)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PlaylistsM3u

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Enter M3U URL**: Paste a valid M3U playlist URL in the input field
2. **Load Playlist**: Click "Load" to fetch and parse the playlist
3. **Browse Channels**: Navigate to the Channels tab to see all available channels
4. **Play Content**: Click on any channel to start streaming
5. **Embed Player**: Use the Embed button to generate iframe code for your website

### First-Time Setup

On first launch, users will be presented with:
- Terms of Use
- Privacy Policy
- FAQ & Documentation overview

Users can either:
- **Accept**: Full access to all content including restricted channels
- **Decline**: Limited access with restricted channels disabled

## Channel Restrictions

The application includes a configurable list of channels that may be restricted in certain regions (e.g., Russia). 

- Users who **accept** terms: All channels are accessible
- Users who **decline** terms: Restricted channels are disabled

To modify the restricted channels list, edit `src/constants.js`:

```javascript
const RESTRICTED_CHANNELS_RF = [
  'дождь',
  'dozhd',
  'tvrain',
  // Add more channels here
];
```

## Embedding

To embed the player on your website:

1. Click the **Embed** button in the app header
2. Copy the generated iframe code
3. Paste it into your website's HTML

Example:
```html
<iframe src="https://your-domain.com/?embed=true" width="100%" height="600" frameborder="0" allowfullscreen></iframe>
```

## Project Structure

```
PlaylistsM3u/
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
├── postcss.config.js       # PostCSS configuration
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main application component
    ├── index.css           # Global styles
    ├── constants.js        # App constants and legal content
    ├── components/
    │   └── Player.jsx      # Video player component
    └── utils/
        └── m3uParser.js    # M3U playlist parser
```

## Configuration

### CDN Player Sources

The application automatically tries multiple CDN sources for the player library. To modify the source list, edit `src/constants.js`:

```javascript
const CDN_PLAYER_SOURCES = [
  'https://cdn.jsdelivr.net/gh/OinkTechLtd/cdnplayerjs@latest/dist/player.min.js',
  'https://cdn.jsdelivr.net/gh/OinkTechLLC/cdnplayerjs@latest/dist/player.min.js',
  'https://cdn.jsdelivr.net/gh/Twixoffltdco/cdnplayerjs@latest/dist/player.min.js',
];
```

### Legal Content

Edit the following in `src/constants.js`:
- `TERMS_OF_USE` - Terms of service content
- `PRIVACY_POLICY` - Privacy policy content
- `FAQ` - Frequently asked questions
- `DOCS` - User documentation

## Mobile Optimization

The application is fully optimized for mobile devices:

- Touch-friendly interface
- Responsive design
- Optimized scrolling
- Minimal latency
- Full-screen player support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

ISC

## Disclaimer

This application is a player only. It does not host, provide, or distribute any video content. All content is streamed from third-party M3U playlists provided by users. Users are responsible for ensuring they have the right to access and view the content they stream.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**PlaylistsM3u** © 2024 - M3U IPTV Player
