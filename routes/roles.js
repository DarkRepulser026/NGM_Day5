const express = require('express');
const router = express.Router();
const Role = require('../schemas/roles');
const User = require('../schemas/users');

// Create Role
router.post('/', async (req, res) => {
    try {
        const role = new Role(req.body);
        await role.save();
        res.status(201).json({ success: true, data: role });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get all Roles
router.get('/', async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.query.id) {
            query._id = req.query.id;
        }
        const roles = await Role.find(query);
        res.status(200).json({ success: true, count: roles.length, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Role by ID
router.get('/:id', async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.status(200).json({ success: true, data: role });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Role
router.put('/:id', async (req, res) => {
    try {
        const role = await Role.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true, runValidators: true });
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.status(200).json({ success: true, data: role });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete Role (Soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.status(200).json({ success: true, message: 'Role soft deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete Role by Query ID (Soft delete)
router.delete('/', async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({ success: false, message: 'ID query parameter is required' });
        }
        const role = await Role.findByIdAndUpdate(req.query.id, { isDeleted: true }, { new: true });
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.status(200).json({ success: true, message: 'Role soft deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all users with a specific role ID
router.get('/:id/users', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        const users = await User.find({ role: req.params.id, isDeleted: false });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
