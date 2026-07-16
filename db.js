const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            family: 4
        });
        console.log('MongoDB Connected!');
    } catch (error) {
        console.log('MongoDB connection failed:', error.message);
    }
};

module.exports = connectDB;