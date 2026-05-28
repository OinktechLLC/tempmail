import { useState, useEffect, useRef } from 'react';
import { CDN_PLAYER_SOURCES } from '../constants';

function Player({ streamUrl, onClose }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!streamUrl) return;

    const loadPlayer = async () => {
      // Remove any existing player script
      const existingScripts = document.querySelectorAll('script[src*="cdnplayerjs"]');
      existingScripts.forEach(script => script.remove());

      // Clear previous player
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      try {
        // Try to load player from current source
        const script = document.createElement('script');
        script.src = CDN_PLAYER_SOURCES[currentSourceIndex];
        script.async = true;

        script.onload = () => {
          setPlayerLoaded(true);
          setError(null);
          
          // Initialize player after a short delay to ensure script is fully loaded
          setTimeout(() => {
            initPlayer();
          }, 100);
        };

        script.onerror = () => {
          // Try next source
          if (currentSourceIndex < CDN_PLAYER_SOURCES.length - 1) {
            setCurrentSourceIndex(prev => prev + 1);
          } else {
            setError('Failed to load player from all sources. Please check your connection.');
          }
        };

        document.head.appendChild(script);
      } catch (err) {
        setError('Error initializing player: ' + err.message);
      }
    };

    const initPlayer = () => {
      if (!containerRef.current || !window.CDNPlayer) {
        // Try alternative initialization
        if (window.PlayerJS) {
          try {
            new window.PlayerJS(containerRef.current, {
              file: streamUrl,
              hls: {
                startLevel: -1,
              },
            });
            return;
          } catch (e) {
            console.log('PlayerJS init failed:', e);
          }
        }
        
        // Fallback: create video element directly
        if (containerRef.current) {
          const video = document.createElement('video');
          video.src = streamUrl;
          video.controls = true;
          video.autoplay = true;
          video.style.width = '100%';
          video.style.height = '100%';
          containerRef.current.appendChild(video);
        }
        return;
      }

      try {
        // Initialize CDN Player
        const player = new window.CDNPlayer(containerRef.current, {
          file: streamUrl,
          hls: {
            startLevel: -1,
            autoStartLoad: true,
          },
        });
        playerRef.current = player;
      } catch (e) {
        console.log('CDNPlayer init failed:', e);
        // Fallback to native video
        if (containerRef.current) {
          const video = document.createElement('video');
          video.src = streamUrl;
          video.controls = true;
          video.autoplay = true;
          video.style.width = '100%';
          video.style.height = '100%';
          containerRef.current.appendChild(video);
        }
      }
    };

    loadPlayer();

    return () => {
      // Cleanup
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      const scripts = document.querySelectorAll('script[src*="cdnplayerjs"]');
      scripts.forEach(script => script.remove());
    };
  }, [streamUrl, currentSourceIndex]);

  const handleRetry = () => {
    if (currentSourceIndex < CDN_PLAYER_SOURCES.length - 1) {
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      setCurrentSourceIndex(0);
    }
    setPlayerLoaded(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close player"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-white font-semibold">Now Playing</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Player Container */}
      <div className="flex-1 relative" ref={containerRef}>
        {!playerLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading player...</p>
              <p className="text-gray-600 text-sm mt-2">
                Source {currentSourceIndex + 1} of {CDN_PLAYER_SOURCES.length}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-red-500 mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="btn-primary"
              >
                {currentSourceIndex < CDN_PLAYER_SOURCES.length - 1 ? 'Try Next Source' : 'Retry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Player;
