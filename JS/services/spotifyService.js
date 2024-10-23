// Contains Spotify API logic

const SpotifyWebApi = require('spotify-web-api-node');

// Spotify API credentials
const CLIENT_ID_SPOTIFY = process.env.CLIENT_ID_SPOTIFY;
const CLIENT_SECRET_SPOTIFY = process.env.CLIENT_SECRET_SPOTIFY;
const REDIRECT_URI_SPOTIFY = process.env.REDIRECT_URI_SPOTIFY;

// Spotify API setup
const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID_SPOTIFY,
    clientSecret: CLIENT_SECRET_SPOTIFY,
    redirectUri: REDIRECT_URI_SPOTIFY
});


// Handle Spotify callback and exchange the authorization code for access tokens
const handleSpotifyCallback = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.send('No code provided for Spotify');
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);

        res.redirect('/fetch_spotify_playlists');
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        res.send('Error fetching Spotify playlists');
    }
};

// Fetch Spotify playlists
const fetchSpotifyPlaylists = async (req, res) => {
    try {
        const playlists = await spotifyApi.getUserPlaylists();

        let message = req.query.message || ''; // Get success/error message from the query string
        let playlistInfo = '<h1>Your Spotify Playlists</h1>';
        
        // Show the success/error message if available
        if (message) {
            playlistInfo += `<div class="alert alert-success">${message}</div>`;
        }

        playlistInfo += '<ul>';
        playlists.body.items.forEach(playlist => {
            playlistInfo += `<li>${playlist.name} <a href="/convert_playlist?playlist_id=${playlist.id}">Convert to YouTube</a></li>`;
        });
        playlistInfo += '</ul>';

        res.send(playlistInfo);
    } catch (error) {
        console.error('Error fetching Spotify playlists:', error);
        res.send('Error fetching Spotify playlists');
    }
};

module.exports = {
    spotifyApi,
    handleSpotifyCallback,
    fetchSpotifyPlaylists
};
