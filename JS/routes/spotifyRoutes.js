// Handles Spotify OAuth and playlist retrieval

const express = require('express');
const router = express.Router();
const { spotifyApi, handleSpotifyCallback, fetchSpotifyPlaylists } = require('../services/spotifyService');

// Serve the homepage with both login options
router.get('/', (req, res) => {
    res.send(`
        <a href="${spotifyApi.createAuthorizeURL(['playlist-read-private', 'playlist-read-collaborative'])}">Login with Spotify</a>
    `);
});

// Spotify OAuth2 callback
router.get('/callback_spotify', handleSpotifyCallback);

// Fetch Spotify playlists
router.get('/fetch_spotify_playlists', fetchSpotifyPlaylists);

module.exports = router;