// Handles YouTube OAuth and playlist creation

const express = require('express');
const router = express.Router();
const { handleYouTubeCallback, convertPlaylist } = require('../services/youtubeService');

// YouTube OAuth2 callback
router.get('/callback_youtube', handleYouTubeCallback);

// Convert Spotify playlist to YouTube playlist
router.get('/convert_playlist', convertPlaylist);

module.exports = router;
