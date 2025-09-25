const { db } = require('../config/firebase');
const { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } = require('firebase/firestore');

class FirebaseService {
    constructor() {
        this.db = db;
    }

    // Activity logs operations
    async getActivities(filters = {}) {
        try {
            let q = query(collection(this.db, 'activitylogs'));
            
            // Apply filters
            if (filters.type && filters.type !== 'all') {
                q = query(q, where('activity_type', '==', filters.type));
            }
            
            if (filters.status && filters.status !== 'all') {
                q = query(q, where('bin_status', '==', filters.status));
            }
            
            if (filters.priority && filters.priority !== 'all') {
                // Map priority to bin_level ranges
                switch (filters.priority) {
                    case 'urgent':
                        q = query(q, where('bin_level', '>', 90));
                        break;
                    case 'high':
                        q = query(q, where('bin_level', '>', 70));
                        break;
                    case 'medium':
                        q = query(q, where('bin_level', '>', 50));
                        break;
                    case 'low':
                        q = query(q, where('bin_level', '<=', 50));
                        break;
                }
            }
            
            // Order by creation date and limit results
            q = query(q, orderBy('created_at', 'desc'));
            if (filters.limit) {
                q = query(q, limit(parseInt(filters.limit)));
            }
            
            const snapshot = await getDocs(q);
            let activities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Apply search filter after fetching (since Firestore doesn't support full-text search)
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                activities = activities.filter(activity => {
                    const data = activity;
                    return (
                        data.bin_location?.toLowerCase().includes(searchTerm) ||
                        data.assigned_janitor_name?.toLowerCase().includes(searchTerm) ||
                        data.activity_type?.toLowerCase().includes(searchTerm)
                    );
                });
            }
            
            return activities;
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    async getActivityById(id) {
        try {
            const docRef = doc(this.db, 'activitylogs', id);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                return null;
            }
            return { id: docSnap.id, ...docSnap.data() };
        } catch (error) {
            console.error('Error fetching activity:', error);
            throw error;
        }
    }

    async createActivity(activityData) {
        try {
            const docRef = await addDoc(collection(this.db, 'activitylogs'), {
                ...activityData,
                created_at: new Date().toISOString(),
                auto_created: false
            });
            return { id: docRef.id, ...activityData };
        } catch (error) {
            console.error('Error creating activity:', error);
            throw error;
        }
    }

    async updateActivity(id, activityData) {
        try {
            const docRef = doc(this.db, 'activitylogs', id);
            await updateDoc(docRef, {
                ...activityData,
                updated_at: new Date().toISOString()
            });
            return { id, ...activityData };
        } catch (error) {
            console.error('Error updating activity:', error);
            throw error;
        }
    }

    async deleteActivity(id) {
        try {
            const docRef = doc(this.db, 'activitylogs', id);
            await deleteDoc(docRef);
            return { id };
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw error;
        }
    }

    async getActivityStats() {
        try {
            const snapshot = await getDocs(collection(this.db, 'activitylogs'));
            const activities = snapshot.docs.map(doc => doc.data());
            
            const stats = {
                alerts: activities.filter(a => a.bin_level > 80).length,
                inProgress: activities.filter(a => a.bin_status === 'in_progress').length,
                collections: activities.filter(a => a.activity_type === 'collection' && a.bin_status === 'completed').length,
                maintenance: activities.filter(a => a.activity_type === 'maintenance').length
            };
            
            return stats;
        } catch (error) {
            console.error('Error fetching activity stats:', error);
            throw error;
        }
    }

    // Notifications operations (using logs collection for now)
    async getNotifications(filters = {}) {
        try {
            // For now, return empty array if logs collection doesn't exist
            // In a real app, you would create notifications in the logs collection
            return [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Return empty array instead of throwing error
            return [];
        }
    }

    async createNotification(notificationData) {
        try {
            // For now, just return success without creating in database
            return { id: 'temp-id', ...notificationData };
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async markNotificationAsRead(id) {
        try {
            // For now, just return success
            return { id };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllNotificationsAsRead() {
        try {
            // For now, just return success
            return { updated: 0 };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotification(id) {
        try {
            // For now, just return success
            return { id };
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    async getUnreadNotificationCount() {
        try {
            // For now, return 0
            return 0;
        } catch (error) {
            console.error('Error getting unread notification count:', error);
            return 0;
        }
    }

    // Real-time listeners
    setupActivityListener(callback) {
        return this.db.collection('activitylogs')
            .orderBy('created_at', 'desc')
            .limit(50)
            .onSnapshot(callback);
    }

    setupNotificationListener(callback) {
        return this.db.collection('logs')
            .orderBy('created_at', 'desc')
            .limit(20)
            .onSnapshot(callback);
    }
}

module.exports = new FirebaseService();
