from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/auth/login', methods=['GET'])
def login():
    auth_manager = SpotifyOAuth(
        client_id=os.getenv('SPOTIFY_CLIENT_ID'),
        client_secret=os.getenv('SPOTIFY_CLIENT_SECRET'),
        redirect_uri=os.getenv('SPOTIFY_REDIRECT_URI'),
        scope='user-top-read user-read-recently-played playlist-modify-public'
    )
    
    auth_url = auth_manager.get_authorize_url()
    return jsonify({'auth_url': auth_url})

@app.route('/api/auth/callback')
def callback():
    auth_manager = SpotifyOAuth(
        client_id=os.getenv('SPOTIFY_CLIENT_ID'),
        client_secret=os.getenv('SPOTIFY_CLIENT_SECRET'),
        redirect_uri=os.getenv('SPOTIFY_REDIRECT_URI'),
        scope='user-top-read user-read-recently-played playlist-modify-public'
    )
    code = request.args.get('code')
    token_info = auth_manager.get_access_token(code)
    # Redirect to React with token in query string
    frontend_url = f"http://localhost:3000/?access_token={token_info['access_token']}"
    return redirect(frontend_url)

@app.route('/api/user/top-tracks')
def get_top_tracks():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'No token provided'}), 401
    
    sp = spotipy.Spotify(auth=token)
    results = sp.current_user_top_tracks(limit=20, offset=0, time_range='medium_term')
    return jsonify(results)

# Add a test route to verify the API is working
@app.route('/api/test')
def test():
    return jsonify({'message': 'Flask API is working!'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)