const mongoose = require('mongoose');

// Funkcja do nawiązania połączenia z MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/projekt1', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); // Zamyka aplikację w razie błędu
    }
};

// Eksportowanie funkcji
module.exports = connectDB;
