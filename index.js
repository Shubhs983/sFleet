const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/driver');
const orderRoutes = require('./routes/order');

const protect = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server + attach Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Global middleware
app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/order', orderRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Delivery Tracker API is running!" });
});

app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/test.html');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('driver:updateLocation', (data) => {
        console.log('Driver location update:', data);
        io.to(data.orderId).emit('driver:locationUpdated', data);
    });

    socket.on('ride:join', (rideId) => {
        socket.join(rideId);
        console.log(`User joined ride room: ${rideId}`);
    });

    socket.on('ride:updateStatus', (data) => {
        io.to(data.rideId).emit('ride:statusUpdated', data);
        console.log(`Ride ${data.rideId} status updated:`, data.status);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handler (must be last)
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});