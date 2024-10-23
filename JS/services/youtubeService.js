// Contains YouTube API logic

const axios = require('axios');

let youtubeAccessToken; // Store the YouTube access token in memory (you could use sessions or a database)
let pendingPlaylistId; // Temporarily store the playlist ID that needs to be converted

// YouTube API credentials
const CLIENT_ID_YT = process.env.CLIENT_ID_YT;
const CLIENT_SECRET_YT = process.env.CLIENT_SECRET_YT;
const REDIRECT_URI_YT = process.env.REDIRECT_URI_YT;

// Handle YouTube OAuth2 callback
const handleYouTubeCallback = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.send('No code provided for YouTube');
    }

    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: CLIENT_ID_YT,
            client_secret: CLIENT_SECRET_YT,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI_YT
        });

        youtubeAccessToken = response.data.access_token; // Store YouTube access token
        console.log(`YouTube Access Token: ${youtubeAccessToken}`); // Log access token

        // Check if there's a pending playlist to convert after login
        if (pendingPlaylistId) {
            res.redirect(`/convert_playlist?playlist_id=${pendingPlaylistId}`);
        } else {
            res.send('YouTube login successful!');
        }
    } catch (error) {
        console.error('Error fetching YouTube access token:', error);
        res.send('Error fetching YouTube access token');
    }
};

// Convert Spotify playlist to YouTube playlist


const convertPlaylist = async (req, res) => {
    const playlistId = req.query.playlist_id;

    // If no YouTube access token, redirect to YouTube login
    if (!youtubeAccessToken) {
        pendingPlaylistId = playlistId; // Store the playlist ID to convert after login
        const youtubeScopes = [
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.force-ssl'
        ];
        const youtubeAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID_YT}&redirect_uri=${REDIRECT_URI_YT}&scope=${youtubeScopes.join(' ')}&response_type=code&access_type=offline`;
        return res.redirect(youtubeAuthUrl); // Redirect to YouTube login
    }

    try {
        const { spotifyApi } = require('./spotifyService'); // Import spotifyApi

        const tracks = await spotifyApi.getPlaylistTracks(playlistId); // Use spotifyApi from spotifyService

        // Step 1: Create a new YouTube playlist
        const youtubePlaylistResponse = await axios.post('https://www.googleapis.com/youtube/v3/playlists?part=snippet', {
            snippet: {
                title: 'New Playlist from Spotify',
                description: 'Created from Spotify playlist tracks',
                privacyStatus: 'private'
            }
        }, {
            headers: {
                Authorization: `Bearer ${youtubeAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const youtubePlaylistId = youtubePlaylistResponse.data.id;

        // Step 2: Search YouTube for each track and add to the new playlist
        for (const trackItem of tracks.body.items) {
            const track = trackItem.track;
            const query = `${track.name} ${track.artists.map(artist => artist.name).join(' ')}`;

            const youtubeSearchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                headers: {
                    Authorization: `Bearer ${youtubeAccessToken}`
                },
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults: 1
                }
            });

            const videoId = youtubeSearchResponse.data.items[0]?.id?.videoId;
            if (videoId) {
                await axios.post('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
                    snippet: {
                        playlistId: youtubePlaylistId,
                        resourceId: {
                            kind: 'youtube#video',
                            videoId: videoId
                        }
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${youtubeAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        }

         // Redirect back to the homepage or playlist selection page with success message
         return res.redirect(`/fetch_spotify_playlists?message=YouTube playlist created and videos added successfully!`);

    } catch (error) {
        if (error.response) {
            console.error('Error converting playlist:', error.response.data);
        } else {
            console.error('Error converting playlist:', error.message);
        }
        return res.redirect(`/fetch_spotify_playlists?message=Error converting playlist. Please try again.`);
    }
};


module.exports = {
    handleYouTubeCallback,
    convertPlaylist
};