const express = require('express');
const router = express.Router();
const User = require('../schemas/users');

// Create User
router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get all Users with username search (includes)
router.get('/', async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.query.username) {
            query.username = { $regex: req.query.username, $options: 'i' };
        }
        if (req.query.id) {
            query._id = req.query.id;
        }
        const users = await User.find(query).populate('role');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get User by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update User
router.put('/:id?', async (req, res) => {
    try {
        const id = req.params.id || req.query.id;
        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        const user = await User.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Soft Delete User
router.delete('/:id?', async (req, res) => {
    try {
        const id = req.params.id || req.query.id;
        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        const user = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User soft deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Enable User
router.post('/enable', async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or information incorrect' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Disable User
router.post('/disable', async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: false },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or information incorrect' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

