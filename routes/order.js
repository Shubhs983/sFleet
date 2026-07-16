const express = require('express');
const Order = require('../models/Order');
const protect = require('../middleware/auth');

const router = express.Router();

// Create a new order (customer requests a ride)
router.post('/create', protect, async (req, res) => {
    try {
        const { pickupLongitude, pickupLatitude, dropLongitude, dropLatitude } = req.body;

        const order = new Order({
            customer: req.user.userId,
            pickupLocation: {
                type: 'Point',
                coordinates: [pickupLongitude, pickupLatitude]
            },
            dropLocation: {
                type: 'Point',
                coordinates: [dropLongitude, dropLatitude]
            }
        });

        await order.save();

        res.json({
            success: true,
            message: "Order created successfully!",
            data: order
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});
// Update order status (driver accepts, picks up, delivers etc)
router.patch('/:orderId/status', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.json({
                success: false,
                message: "Order not found!"
            });
        }

        // If driver is accepting the order
        if (status === 'accepted') {
            order.driver = req.user.userId;
        }

        order.status = status;
        await order.save();
        req.io.to(orderId).emit('order:statusUpdated',order);

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});
// Rate a completed order
router.patch('/:orderId/rate', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rating, review } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.json({
                success: false,
                message: "Order not found!"
            });
        }

        if (order.status !== 'completed') {
            return res.json({
                success: false,
                message: "You can only rate a completed order!"
            });
        }

        order.rating = rating;
        order.review = review;
        await order.save();

        res.json({
            success: true,
            message: "Thank you for your rating!",
            data: order
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});
// Get logged-in user's order history (works for both customer and driver)
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [
                { customer: req.user.userId },
                { driver: req.user.userId }
            ]
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            message: `Found ${orders.length} orders`,
            data: orders
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});
module.exports = router;