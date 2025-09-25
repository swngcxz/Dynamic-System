// Fallback service that provides sample data when Firebase is not accessible
class FallbackService {
    constructor() {
        this.sampleActivities = [
            {
                id: 'fallback-1',
                timestamp: '2025-09-25T01:12:00Z',
                activity_type: 'task_assignment',
                description_main: 'Bin bin1 at Central Plaza',
                description_note: 'Critical bin level - requires immediate collection',
                assigned_to: 'Glendon Rose Marie',
                location: 'Central Plaza',
                status: 'pending',
                priority: 'high',
                details: ['Level: 85%'],
                bin_id: 'bin1',
                weight: 85
            },
            {
                id: 'fallback-2',
                timestamp: '2025-09-25T00:12:00Z',
                activity_type: 'bin_emptied',
                description_main: 'Bin bin1 at Central Plaza',
                description_note: 'Bin emptied successfully',
                assigned_to: 'Jeralyn Peritos',
                location: 'Central Plaza',
                status: 'done',
                priority: 'medium',
                details: ['Level: 10%', 'Bin: normal'],
                bin_id: 'bin1',
                weight: 10
            },
            {
                id: 'fallback-3',
                timestamp: '2025-09-24T23:12:00Z',
                activity_type: 'maintenance',
                description_main: 'Bin bin1 at Central Plaza',
                description_note: 'Routine maintenance check',
                assigned_to: 'John Dave Laparan',
                location: 'Central Plaza',
                status: 'in_progress',
                priority: 'low',
                details: [],
                bin_id: 'bin1',
                weight: 0
            },
            {
                id: 'fallback-4',
                timestamp: '2025-09-24T22:12:00Z',
                activity_type: 'bin_alert',
                description_main: 'Bin bin1 at Central Plaza',
                description_note: 'Automated alert: Bin critically full',
                assigned_to: 'Glendon Rose Marie',
                location: 'Central Plaza',
                status: 'in_progress',
                priority: 'urgent',
                details: ['Level: 95%'],
                bin_id: 'bin1',
                weight: 95
            }
        ];
    }

    async getActivities(filters = {}) {
        let activities = [...this.sampleActivities];
        
        // Apply filters
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            activities = activities.filter(activity => 
                activity.description_main.toLowerCase().includes(searchTerm) ||
                activity.assigned_to.toLowerCase().includes(searchTerm) ||
                activity.location.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.type && filters.type !== 'all') {
            activities = activities.filter(activity => activity.activity_type === filters.type);
        }
        
        if (filters.status && filters.status !== 'all') {
            activities = activities.filter(activity => activity.status === filters.status);
        }
        
        if (filters.priority && filters.priority !== 'all') {
            activities = activities.filter(activity => activity.priority === filters.priority);
        }
        
        // Apply limit
        if (filters.limit) {
            activities = activities.slice(0, parseInt(filters.limit));
        }
        
        return activities;
    }

    async getActivityById(id) {
        return this.sampleActivities.find(activity => activity.id === id) || null;
    }

    async getActivityStats() {
        return {
            alerts: this.sampleActivities.filter(a => a.priority === 'urgent' || a.priority === 'high').length,
            inProgress: this.sampleActivities.filter(a => a.status === 'in_progress').length,
            collections: this.sampleActivities.filter(a => a.activity_type === 'bin_emptied' && a.status === 'done').length,
            maintenance: this.sampleActivities.filter(a => a.activity_type === 'maintenance').length
        };
    }

    async getNotifications() {
        return [];
    }

    async getUnreadNotificationCount() {
        return 0;
    }
}

module.exports = new FallbackService();

