const express = require('express');
const router = express.Router();
const firebaseService = require('../services/firebaseService');
const fallbackService = require('../services/fallbackService');
const db = require('../database/database');

// Get all activities with optional filtering
router.get('/', async (req, res) => {
    try {
        const { search, type, status, priority, limit = 50, offset = 0 } = req.query;
        
        const filters = {
            search,
            type,
            status,
            priority,
            limit
        };
        
        let activities;
        let usingFirebase = true;
        
        try {
            activities = await firebaseService.getActivities(filters);
            
            // Transform Firebase data to match expected format
            const transformedActivities = activities.map(activity => ({
                id: activity.id,
                timestamp: activity.created_at || activity.collection_time,
                activity_type: activity.activity_type,
                description_main: activity.bin_location || activity.bin_id,
                description_note: activity.completion_notes || '',
                assigned_to: activity.assigned_janitor_name || 'System',
                location: activity.bin_location || 'Unknown',
                status: activity.bin_status || 'pending',
                priority: activity.bin_level > 80 ? 'urgent' : activity.bin_level > 60 ? 'high' : activity.bin_level > 40 ? 'medium' : 'low',
                details: [
                    activity.bin_level ? `Level: ${activity.bin_level}%` : '',
                    activity.bin_condition ? `Condition: ${activity.bin_condition}` : '',
                    activity.collected_weight ? `Weight: ${activity.collected_weight}kg` : ''
                ].filter(Boolean),
                bin_id: activity.bin_id,
                weight: activity.collected_weight || activity.bin_level
            }));
            
            res.json(transformedActivities);
        } catch (firebaseError) {
            console.log('Firebase unavailable, using fallback data:', firebaseError.message);
            usingFirebase = false;
            activities = await fallbackService.getActivities(filters);
            res.json(activities);
        }
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// Get activity by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const activity = await firebaseService.getActivityById(id);
        
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        // Transform Firebase data to match expected format
        const transformedActivity = {
            id: activity.id,
            timestamp: activity.created_at || activity.collection_time,
            activity_type: activity.activity_type,
            description_main: activity.bin_location || activity.bin_id,
            description_note: activity.completion_notes || '',
            assigned_to: activity.assigned_janitor_name || 'System',
            location: activity.bin_location || 'Unknown',
            status: activity.bin_status || 'pending',
            priority: activity.bin_level > 80 ? 'urgent' : activity.bin_level > 60 ? 'high' : activity.bin_level > 40 ? 'medium' : 'low',
            details: [
                activity.bin_level ? `Level: ${activity.bin_level}%` : '',
                activity.bin_condition ? `Condition: ${activity.bin_condition}` : '',
                activity.collected_weight ? `Weight: ${activity.collected_weight}kg` : ''
            ].filter(Boolean),
            bin_id: activity.bin_id,
            weight: activity.collected_weight || activity.bin_level
        };
        
        res.json(transformedActivity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Create new activity
router.post('/', (req, res) => {
    const {
        activity_type,
        description,  // New format from modal
        description_main,  // Old format
        description_note,
        assigned_to,
        location,
        status,
        priority,
        details,
        bin_id,
        weight,
        due_date,
        notes  // New field from modal
    } = req.body;
    
    // Handle both old and new data formats
    const finalDescription = description || description_main || 'Task Assignment';
    const finalDescriptionNote = notes || description_note || '';
    
    // Create details array
    const detailsArray = [];
    if (details && Array.isArray(details)) {
        detailsArray.push(...details);
    } else if (details) {
        detailsArray.push(details);
    }
    if (due_date) {
        detailsArray.push(`Due: ${new Date(due_date).toLocaleDateString()}`);
    }
    
    const detailsJson = JSON.stringify(detailsArray);
    
    const query = `INSERT INTO activities (
        timestamp, activity_type, description_main, description_note,
        assigned_to, location, status, priority, details, bin_id, weight
    ) VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [
        activity_type,
        finalDescription,
        finalDescriptionNote,
        assigned_to,
        location,
        status,
        priority,
        detailsJson,
        bin_id || `task_${Date.now()}`,
        weight || 0
    ], function(err) {
        if (err) {
            console.error('Error creating activity:', err);
            return res.status(500).json({ error: 'Failed to create activity' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('newActivity', {
                id: this.lastID,
                timestamp: new Date().toISOString(),
                activity_type,
                description_main: finalDescription,
                description_note: finalDescriptionNote,
                assigned_to,
                location,
                status,
                priority,
                details: detailsArray,
                bin_id: bin_id || `task_${Date.now()}`,
                weight: weight || 0
            });
        }
        
        res.status(201).json({
            id: this.lastID,
            message: 'Activity created successfully'
        });
    });
});

// Update activity
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
        activity_type,
        description_main,
        description_note,
        assigned_to,
        location,
        status,
        priority,
        details,
        bin_id,
        weight
    } = req.body;
    
    const detailsJson = details ? JSON.stringify(details) : JSON.stringify([]);
    
    const query = `UPDATE activities SET 
        activity_type = ?, description_main = ?, description_note = ?,
        assigned_to = ?, location = ?, status = ?, priority = ?,
        details = ?, bin_id = ?, weight = ?
        WHERE id = ?`;
    
    db.run(query, [
        activity_type,
        description_main,
        description_note,
        assigned_to,
        location,
        status,
        priority,
        detailsJson,
        bin_id,
        weight,
        id
    ], function(err) {
        if (err) {
            console.error('Error updating activity:', err);
            return res.status(500).json({ error: 'Failed to update activity' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('activityUpdated', {
                id: parseInt(id),
                activity_type,
                description_main,
                description_note,
                assigned_to,
                location,
                status,
                priority,
                details: details || [],
                bin_id,
                weight
            });
        }
        
        res.json({ message: 'Activity updated successfully' });
    });
});

// Delete activity
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM activities WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting activity:', err);
            return res.status(500).json({ error: 'Failed to delete activity' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('activityDeleted', { id: parseInt(id) });
        }
        
        res.json({ message: 'Activity deleted successfully' });
    });
});

// Get activity statistics
router.get('/stats/overview', async (req, res) => {
    try {
        let stats;
        try {
            stats = await firebaseService.getActivityStats();
        } catch (firebaseError) {
            console.log('Firebase unavailable for stats, using fallback data');
            stats = await fallbackService.getActivityStats();
        }
        res.json(stats);
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({ error: 'Failed to fetch activity statistics' });
    }
});

module.exports = router;
