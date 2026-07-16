const express = require('express');
const Driver = require('../models/Driver');
const protect = require('../middleware/auth');

const router = express.Router();

// Update driver location
router.post('/update-location', protect, async (req, res) => {
    try {
        const { longitude, latitude, isAvailable } = req.body;

        const driver = await Driver.findOneAndUpdate(
            { user: req.user.userId },
            {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                isAvailable
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: "Location updated!",
            data: driver
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

// Find nearby drivers
router.get('/nearby', protect, async (req, res) => {
    try {
        const { longitude, latitude } = req.query;

        const drivers = await Driver.find({
            isAvailable: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 5000
                }
            }
        }).populate('user', 'name email');

        res.json({
            success: true,
            message: `Found ${drivers.length} nearby drivers!`,
            data: drivers
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;