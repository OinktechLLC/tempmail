function parseM3U(content) {
  const lines = content.split('\n');
  const channels = [];
  let currentChannel = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('#EXTINF:')) {
      // Extract channel name from EXTINF line
      const info = trimmedLine.substring(8);
      const parts = info.split(',');
      const name = parts[parts.length - 1].trim();
      
      // Extract logo if present
      const logoMatch = trimmedLine.match(/tvg-logo="([^"]*)"/);
      const logo = logoMatch ? logoMatch[1] : null;
      
      currentChannel = {
        name,
        logo,
        url: null,
      };
    } else if (trimmedLine && !trimmedLine.startsWith('#') && currentChannel) {
      // This is the URL line
      currentChannel.url = trimmedLine;
      channels.push(currentChannel);
      currentChannel = null;
    }
  }

  return channels;
}

async function fetchM3U(url) {
  try {
    // Try direct fetch first
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    // If direct fetch fails, try CORS proxy
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    for (const proxy of corsProxies) {
      try {
        const response = await fetch(proxy);
        if (!response.ok) continue;
        const text = await response.text();
        return parseM3U(text);
      } catch (e) {
        continue;
      }
    }

    throw new Error('Failed to fetch M3U playlist. The URL may be inaccessible or CORS-restricted.');
  }
}

export { parseM3U, fetchM3U };
