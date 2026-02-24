const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Debug all routes
app.all('*', (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Test simple response
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
    console.log('Test: http://localhost:3000/api/test');
});
