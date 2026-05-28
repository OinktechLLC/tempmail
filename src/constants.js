// List of channels restricted in RF (example list)
const RESTRICTED_CHANNELS_RF = [
  'дождь',
  'dozhd',
  'tvrain',
  'tv rain',
  'эхо москвы',
  'echo moskvy',
  'mtv russia',
  'рен тв',
  'ntv ru',
];

// CDN Player JS sources with fallbacks
const CDN_PLAYER_SOURCES = [
  'https://cdn.jsdelivr.net/gh/OinkTechLtd/cdnplayerjs@latest/dist/player.min.js',
  'https://cdn.jsdelivr.net/gh/OinkTechLLC/cdnplayerjs@latest/dist/player.min.js',
  'https://cdn.jsdelivr.net/gh/Twixoffltdco/cdnplayerjs@latest/dist/player.min.js',
];

// Terms of Use content
const TERMS_OF_USE = `
<h2>Terms of Use</h2>
<p>Welcome to PlaylistsM3u. By using this application, you agree to the following terms:</p>

<h3>1. Acceptance of Terms</h3>
<p>By accessing or using PlaylistsM3u, you agree to be bound by these Terms of Use and all applicable laws and regulations.</p>

<h3>2. User Responsibilities</h3>
<p>You are responsible for ensuring that any M3U playlists you use comply with applicable copyright laws and broadcasting regulations in your jurisdiction.</p>

<h3>3. Content Restrictions</h3>
<p>Certain channels may be restricted based on your location and local regulations. Users who do not accept these terms will have limited access to content.</p>

<h3>4. Disclaimer</h3>
<p>PlaylistsM3u is a player application only. We do not host, provide, or distribute any video content. All content is streamed from third-party M3U playlists provided by users.</p>

<h3>5. Modifications</h3>
<p>We reserve the right to modify these terms at any time. Continued use of the application constitutes acceptance of modified terms.</p>

<h3>6. Termination</h3>
<p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever.</p>
`;

// Privacy Policy content
const PRIVACY_POLICY = `
<h2>Privacy Policy</h2>
<p>Last updated: ${new Date().toLocaleDateString()}</p>

<h3>1. Information Collection</h3>
<p>PlaylistsM3u does not collect, store, or transmit personal information. M3U playlist URLs entered by users are stored locally in your browser only.</p>

<h3>2. Data Usage</h3>
<p>No user data is transmitted to our servers. All processing happens locally in your browser.</p>

<h3>3. Third-Party Services</h3>
<p>The application uses CDN Player JS from third-party repositories. These services may have their own privacy policies.</p>

<h3>4. Cookies</h3>
<p>We use local storage to remember your acceptance of terms and preferences. No tracking cookies are used.</p>

<h3>5. Children's Privacy</h3>
<p>Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children.</p>

<h3>6. Changes to This Policy</h3>
<p>We may update our Privacy Policy from time to time. You are advised to review this page periodically for any changes.</p>
`;

// FAQ content
const FAQ = `
<h2>Frequently Asked Questions</h2>

<h3>What is PlaylistsM3u?</h3>
<p>PlaylistsM3u is a web-based M3U playlist player that allows you to stream IPTV channels directly in your browser using CDN Player JS.</p>

<h3>How do I use it?</h3>
<p>Simply paste a valid M3U playlist URL into the input field, and the application will parse and display available channels for streaming.</p>

<h3>Is it free?</h3>
<p>Yes, PlaylistsM3u is completely free to use.</p>

<h3>Why are some channels disabled?</h3>
<p>Certain channels may be restricted based on local regulations. Users who accept the Terms of Use will have full access, while those who decline will have limited access to certain content.</p>

<h3>Can I embed the player on my website?</h3>
<p>Yes! Use the embed feature to generate an iframe code that you can add to your website.</p>

<h3>What formats are supported?</h3>
<p>The application supports standard M3U and M3U8 playlist formats with HLS streams.</p>

<h3>Is my data safe?</h3>
<p>Yes, all data stays in your browser. We don't collect or store any personal information or playlist URLs on our servers.</p>

<h3>Mobile support?</h3>
<p>The application is fully optimized for mobile devices with a TikTok-like interface for smooth scrolling and navigation.</p>
`;

// Documentation content
const DOCS = `
<h2>Documentation</h2>

<h3>Getting Started</h3>
<ol>
  <li>Open the application in your browser</li>
  <li>Read and accept the Terms of Use and Privacy Policy for full access</li>
  <li>Enter a valid M3U playlist URL</li>
  <li>Browse available channels</li>
  <li>Click on a channel to start streaming</li>
</ol>

<h3>M3U Playlist Format</h3>
<p>Your M3U playlist should follow the standard format:</p>
<pre>#EXTM3U
#EXTINF:-1,Channel Name
http://example.com/stream.m3u8</pre>

<h3>Embedding</h3>
<p>To embed the player on your website:</p>
<ol>
  <li>Click the "Embed" button</li>
  <li>Copy the generated iframe code</li>
  <li>Paste it into your website's HTML</li>
</ol>

<h3>API Endpoints</h3>
<p>The application runs entirely client-side. No API calls are made to external servers except for loading the CDN Player JS library.</p>

<h3>Troubleshooting</h3>
<ul>
  <li><strong>Player not loading:</strong> Check if the M3U URL is valid and accessible</li>
  <li><strong>Channels not showing:</strong> Ensure the playlist follows standard M3U format</li>
  <li><strong>Stream not playing:</strong> Some streams may require specific codecs or may be geo-restricted</li>
</ul>
`;

export {
  RESTRICTED_CHANNELS_RF,
  CDN_PLAYER_SOURCES,
  TERMS_OF_USE,
  PRIVACY_POLICY,
  FAQ,
  DOCS,
};
