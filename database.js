const express = require('express');
const connectDB = require('./database');

const app = express();

// Połączenie z bazą danych
connectDB();

// Middleware (opcjonalne)
app.use(express.json());

// Endpoint testowy
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Uruchomienie serwera
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
