const express = require('express');
const router = express.Router();
const firebaseService = require('../services/firebaseService');
const fallbackService = require('../services/fallbackService');

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const { read_status, limit = 20, offset = 0 } = req.query;
        
        const filters = {
            read_status: read_status === 'true',
            limit
        };
        
        let notifications;
        try {
            notifications = await firebaseService.getNotifications(filters);
        } catch (firebaseError) {
            console.log('Firebase unavailable for notifications, using fallback data');
            notifications = await fallbackService.getNotifications();
        }
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get notification by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM notifications WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching notification:', err);
            return res.status(500).json({ error: 'Failed to fetch notification' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        res.json(row);
    });
});

// Create new notification
router.post('/', (req, res) => {
    const { title, message, type, bin_id } = req.body;
    
    const query = 'INSERT INTO notifications (title, message, type, bin_id) VALUES (?, ?, ?, ?)';
    
    db.run(query, [title, message, type, bin_id], function(err) {
        if (err) {
            console.error('Error creating notification:', err);
            return res.status(500).json({ error: 'Failed to create notification' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('newNotification', {
                id: this.lastID,
                title,
                message,
                type,
                bin_id,
                read_status: false,
                created_at: new Date().toISOString()
            });
        }
        
        res.status(201).json({
            id: this.lastID,
            message: 'Notification created successfully'
        });
    });
});

// Mark notification as read
router.put('/:id/read', (req, res) => {
    const { id } = req.params;
    
    db.run('UPDATE notifications SET read_status = 1 WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error updating notification:', err);
            return res.status(500).json({ error: 'Failed to update notification' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('notificationRead', { id: parseInt(id) });
        }
        
        res.json({ message: 'Notification marked as read' });
    });
});

// Mark all notifications as read
router.put('/mark-all-read', (req, res) => {
    db.run('UPDATE notifications SET read_status = 1 WHERE read_status = 0', function(err) {
        if (err) {
            console.error('Error updating notifications:', err);
            return res.status(500).json({ error: 'Failed to update notifications' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('allNotificationsRead');
        }
        
        res.json({ 
            message: 'All notifications marked as read',
            updated: this.changes
        });
    });
});

// Delete notification
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM notifications WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting notification:', err);
            return res.status(500).json({ error: 'Failed to delete notification' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('notificationDeleted', { id: parseInt(id) });
        }
        
        res.json({ message: 'Notification deleted successfully' });
    });
});

// Get notification count
router.get('/count/unread', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM notifications WHERE read_status = 0', (err, row) => {
        if (err) {
            console.error('Error fetching notification count:', err);
            return res.status(500).json({ error: 'Failed to fetch notification count' });
        }
        
        res.json({ count: row.count });
    });
});

module.exports = router;
