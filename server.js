// Import necessary modules
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs'); // Import fs module to use readdirSync
const path = require('path'); // Import path module to resolve paths

// Initialize the Express app
const app = express();

// Use middlewares
app.use(morgan('dev')); // Morgan for logging
app.use(cors()); // CORS to handle cross-origin requests
app.use(express.json()); // To parse incoming JSON requests

// Automatically load all routes in the "routes" folder
fs.readdirSync(path.join(__dirname, 'routes')).forEach((file) => {
  const route = require(`./routes/${file}`);
  app.use('/api', route); // Mount the routes with '/api' prefix
});

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
