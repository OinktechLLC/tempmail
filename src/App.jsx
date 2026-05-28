import { useState, useEffect } from 'react';
import { fetchM3U } from './utils/m3uParser';
import { RESTRICTED_CHANNELS_RF, TERMS_OF_USE, PRIVACY_POLICY, FAQ, DOCS } from './constants';
import Player from './components/Player';

function App() {
  const [m3uUrl, setM3uUrl] = useState('');
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [activeTab, setActiveTab] = useState('player');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(null);
  const [infoModalContent, setInfoModalContent] = useState(null);

  // Check localStorage for terms acceptance on mount
  useEffect(() => {
    const accepted = localStorage.getItem('playlistsM3u_termsAccepted');
    if (accepted !== null) {
      setTermsAccepted(accepted === 'true');
    } else {
      setShowTermsModal(true);
    }
  }, []);

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    localStorage.setItem('playlistsM3u_termsAccepted', 'true');
    setShowTermsModal(false);
  };

  const handleDeclineTerms = () => {
    setTermsAccepted(false);
    localStorage.setItem('playlistsM3u_termsAccepted', 'false');
    setShowTermsModal(false);
  };

  const isChannelRestricted = (channelName) => {
    const lowerName = channelName.toLowerCase();
    return RESTRICTED_CHANNELS_RF.some(restricted => 
      lowerName.includes(restricted.toLowerCase())
    );
  };

  const loadPlaylist = async () => {
    if (!m3uUrl.trim()) {
      setError('Please enter a valid M3U URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedChannels = await fetchM3U(m3uUrl);
      if (parsedChannels.length === 0) {
        setError('No channels found in the playlist');
      } else {
        setChannels(parsedChannels);
        setActiveTab('channels');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedCode = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `<iframe src="${baseUrl}?embed=true" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    alert('Embed code copied to clipboard!');
  };

  const openInfoModal = (type) => {
    switch (type) {
      case 'terms':
        setInfoModalContent({ title: 'Terms of Use', content: TERMS_OF_USE });
        break;
      case 'privacy':
        setInfoModalContent({ title: 'Privacy Policy', content: PRIVACY_POLICY });
        break;
      case 'faq':
        setInfoModalContent({ title: 'FAQ', content: FAQ });
        break;
      case 'docs':
        setInfoModalContent({ title: 'Documentation', content: DOCS });
        break;
      default:
        break;
    }
  };

  const filteredChannels = channels.map(channel => ({
    ...channel,
    restricted: isChannelRestricted(channel.name),
    disabled: !termsAccepted && isChannelRestricted(channel.name)
  }));

  return (
    <div className="min-h-screen bg-black text-white touch-optimize">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            PlaylistsM3u
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmbedModal(true)}
              className="btn-secondary text-sm py-2 px-3"
              aria-label="Embed player"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <code>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </code>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        {/* Input Section */}
        <div className="px-4 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="card">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Enter M3U Playlist URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="input-field flex-1"
                  disabled={loading}
                />
                <button
                  onClick={loadPlaylist}
                  disabled={loading}
                  className="btn-primary whitespace-nowrap"
                >
                  {loading ? 'Loading...' : 'Load'}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="max-w-7xl mx-auto">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'player' ? 'active' : ''}`}
                onClick={() => setActiveTab('player')}
              >
                Player
              </button>
              <button
                className={`tab ${activeTab === 'channels' ? 'active' : ''}`}
                onClick={() => setActiveTab('channels')}
              >
                Channels ({channels.length})
              </button>
              <button
                className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Info
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4">
          <div className="max-w-7xl mx-auto">
            {/* Player Tab */}
            {activeTab === 'player' && (
              <div className="card">
                {currentChannel ? (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">{currentChannel.name}</h2>
                    <div className="player-container" style={{ height: '400px' }}>
                      <Player
                        streamUrl={currentChannel.url}
                        onClose={() => setCurrentChannel(null)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-600 mb-4">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <p className="text-gray-400">Select a channel to start playing</p>
                    <button
                      onClick={() => setActiveTab('channels')}
                      className="btn-primary mt-4"
                    >
                      Browse Channels
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Channels Tab */}
            {activeTab === 'channels' && (
              <div className="channel-list">
                {filteredChannels.length === 0 ? (
                  <div className="card text-center py-12">
                    <p className="text-gray-400">No channels loaded. Enter an M3U URL above.</p>
                  </div>
                ) : (
                  filteredChannels.map((channel, index) => (
                    <div
                      key={index}
                      className={`channel-item ${channel.disabled ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!channel.disabled) {
                          setCurrentChannel(channel);
                          setActiveTab('player');
                        }
                      }}
                    >
                      {channel.logo && (
                        <img
                          src={channel.logo}
                          alt=""
                          className="w-10 h-10 rounded mr-3 object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{channel.name}</h3>
                        {channel.restricted && (
                          <p className="text-xs text-red-400 mt-1">
                            {termsAccepted ? 'Restricted content - Full access enabled' : 'Restricted content - Limited access'}
                          </p>
                        )}
                      </div>
                      {!channel.disabled && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Information</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openInfoModal('terms')}
                      className="btn-secondary text-left"
                    >
                      Terms of Use
                    </button>
                    <button
                      onClick={() => openInfoModal('privacy')}
                      className="btn-secondary text-left"
                    >
                      Privacy Policy
                    </button>
                    <button
                      onClick={() => openInfoModal('faq')}
                      className="btn-secondary text-left"
                    >
                      FAQ
                    </button>
                    <button
                      onClick={() => openInfoModal('docs')}
                      className="btn-secondary text-left"
                    >
                      Documentation
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                      Status: {termsAccepted === null ? 'Pending' : termsAccepted ? 'Full Access' : 'Limited Access'}
                    </p>
                    {termsAccepted !== null && (
                      <button
                        onClick={() => {
                          localStorage.removeItem('playlistsM3u_termsAccepted');
                          setTermsAccepted(null);
                          setShowTermsModal(true);
                        }}
                        className="text-xs text-red-400 mt-2 underline"
                      >
                        Reset Terms Acceptance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className="modal-overlay" onClick={() => setShowEmbedModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Embed Player</h2>
            <p className="text-gray-400 mb-4">
              Copy this code and paste it into your website to embed the player.
            </p>
            <div className="embed-code bg-black p-4 rounded overflow-x-auto">
              <code className="text-sm text-green-400">{getEmbedCode()}</code>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={copyEmbedCode} className="btn-primary flex-1">
                Copy Code
              </button>
              <button onClick={() => setShowEmbedModal(false)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModalContent && (
        <div className="modal-overlay" onClick={() => setInfoModalContent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{infoModalContent.title}</h2>
            <div 
              className="prose prose-invert max-h-96 overflow-y-auto mb-4"
              dangerouslySetInnerHTML={{ __html: infoModalContent.content }}
            />
            <button onClick={() => setInfoModalContent(null)} className="btn-secondary w-full">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="modal-overlay">
          <div className="modal-content max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Welcome to PlaylistsM3u</h2>
            <p className="text-gray-400 mb-4">
              Please read and accept our Terms of Use and Privacy Policy to continue.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="card bg-black/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Terms of Use
                </h3>
                <div 
                  className="text-sm text-gray-300 max-h-40 overflow-y-auto prose prose-invert"
                  dangerouslySetInnerHTML={{ __html: TERMS_OF_USE }}
                />
              </div>

              <div className="card bg-black/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Privacy Policy
                </h3>
                <div 
                  className="text-sm text-gray-300 max-h-40 overflow-y-auto prose prose-invert"
                  dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY }}
                />
              </div>

              <div className="card bg-black/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  FAQ & Documentation
                </h3>
                <p className="text-sm text-gray-300">
                  You can access our FAQ and Documentation anytime from the Info tab after accepting the terms.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAcceptTerms} className="btn-primary flex-1">
                Accept & Continue
              </button>
              <button onClick={handleDeclineTerms} className="btn-secondary flex-1">
                Decline (Limited Access)
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By accepting, you agree to have full access to all content. By declining, some channels may be restricted.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <span>PlaylistsM3u © {new Date().getFullYear()}</span>
          <span>M3U IPTV Player</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
