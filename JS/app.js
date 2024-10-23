require('dotenv').config()

const express = require('express');
const app = express();
const port = 3000;

// parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// parse JSON bodies
app.use(express.json());

// Import the routes
const spotifyRoutes = require('./routes/spotifyRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');

// Use the routes
app.use(spotifyRoutes);
app.use(youtubeRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
