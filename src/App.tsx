import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Music, User, PlayCircle } from 'lucide-react';
import './App.css'; // CRA uses this for styles (we’ll handle Tailwind next)

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
}

const authEndpoint = process.env.REACT_APP_AUTH_ENDPOINT;
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topTracks, setTopTracks] = useState<Track[]>([]);

  const handleLogin = async () => {
    try {
      const response = await axios.get('authEndpoint');
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const fetchTopTracks = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) return;

      const response = await axios.get('${apiEndpoint}/top-tracks', {
        headers: { Authorization: token }
      });
      setTopTracks(response.data.items);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
      localStorage.setItem('spotify_token', accessToken);
      setIsLoggedIn(true);
      fetchTopTracks();
      window.history.replaceState({}, document.title, '/');
    } else {
      const token = localStorage.getItem('spotify_token');
      if (token) {
        setIsLoggedIn(true);
        fetchTopTracks();
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="w-8 h-8 text-green-500" />
              <span className="text-xl font-bold">Spotify Insights</span>
            </div>
            {!isLoggedIn && (
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Login with Spotify</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoggedIn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topTracks.map((track) => (
              <div
                key={track.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-gray-700/50 transition-colors"
              >
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{track.name}</h3>
                  <p className="text-gray-400">{track.artists.map(a => a.name).join(', ')}</p>
                  <div className="mt-4 flex items-center space-x-2">
                    <PlayCircle className="w-6 h-6 text-green-500" />
                    <span className="text-sm text-gray-400">From: {track.album.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Welcome to Spotify Insights</h2>
            <p className="text-gray-400 mb-8">Login with your Spotify account to see your music insights</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;