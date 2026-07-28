// server.js //

require('dotenv').config();
const express = require('express');
const app = express();

// basic error handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error'});
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan pada port ${PORT}`);
});