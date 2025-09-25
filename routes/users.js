const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all users (for task assignment dropdown)
router.get('/', (req, res) => {
    const query = 'SELECT id, username, email, role FROM users ORDER BY username';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        
        // Transform to match expected format for frontend
        const users = rows.map(user => ({
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            role: user.role
        }));
        
        res.json(users);
    });
});

// Get user by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'SELECT id, username, email, role FROM users WHERE id = ?';
    
    db.get(query, [id], (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            role: user.role
        });
    });
});

module.exports = router;
