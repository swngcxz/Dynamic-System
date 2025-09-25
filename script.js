// ECOBIN Smart Bin Activity Monitoring System - Full Stack Version

// Global variables
let activityData = [];
let filteredActivities = [];
let notifications = [];
let currentSort = { column: 'timestamp', direction: 'desc' };
let socket = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeSocket();
});

async function initializeApp() {
    try {
        await loadActivities();
        await loadNotifications();
        updateOverviewCards();
        renderActivityTable();
        updateLogsCount();
        updateNotificationCount();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showToast('Failed to load data. Please refresh the page.', 'error');
    }
}

async function loadActivities() {
    try {
        activityData = await ecobinAPI.getActivities({ limit: 50 });
        filteredActivities = [...activityData];
    } catch (error) {
        console.error('Failed to load activities:', error);
        throw error;
    }
}

async function loadNotifications() {
    try {
        notifications = await ecobinAPI.getNotifications({ limit: 20 });
    } catch (error) {
        console.error('Failed to load notifications:', error);
        throw error;
    }
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterActivities);
    }
    
    // Filter functionality
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    
    if (typeFilter) typeFilter.addEventListener('change', filterActivities);
    if (statusFilter) statusFilter.addEventListener('change', filterActivities);
    if (priorityFilter) priorityFilter.addEventListener('change', filterActivities);
    
    // Table sorting
    document.addEventListener('click', function(e) {
        if (e.target.closest('.sortable')) {
            const th = e.target.closest('.sortable');
            const column = th.textContent.trim().toLowerCase().replace(/\s+/g, '_').replace('&', 'and');
            sortTable(column);
        }
    });
}

function renderActivityTable() {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredActivities.forEach(activity => {
        const row = document.createElement('tr');
        
        // Handle different timestamp formats from Firebase
        let timestamp;
        if (activity.timestamp) {
            timestamp = typeof activity.timestamp === 'string' 
                ? new Date(activity.timestamp) 
                : activity.timestamp.toDate ? activity.timestamp.toDate() : activity.timestamp;
        } else {
            timestamp = new Date();
        }
        
        const timeStr = formatDateTime(timestamp);
        const activityTypeBadge = getActivityTypeBadge(activity.activity_type);
        const statusBadge = getStatusBadge(activity.status);
        const priorityBadge = getPriorityBadge(activity.priority);
        const detailsHtml = formatDetails(activity.details);
        
        row.innerHTML = `
            <td>${timeStr}</td>
            <td>${activityTypeBadge}</td>
            <td>
                <div class="description-content">
                    <div class="description-main">${activity.description_main || 'Bin Activity'}</div>
                    <div class="description-note">Note: ${activity.description_note || 'No additional notes'}</div>
                </div>
            </td>
            <td>${activity.assigned_to || 'System'}</td>
            <td>${activity.location || 'Unknown'}</td>
            <td>${statusBadge}</td>
            <td>${priorityBadge}</td>
            <td>
                <div class="details-content">
                    ${detailsHtml}
                </div>
            </td>
            <td>
                <button class="actions-button" onclick="showActivityActions('${activity.id}')">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Initialize Socket.IO connection
function initializeSocket() {
    if (typeof io !== 'undefined') {
        socket = io();
        
        socket.on('connect', () => {
            console.log('Connected to server');
        });
        
        socket.on('newActivity', (activity) => {
            activityData.unshift(activity);
            filteredActivities = [...activityData];
            renderActivityTable();
            updateOverviewCards();
            updateLogsCount();
            showToast('New activity received!', 'info');
        });
        
        socket.on('activityUpdated', (activity) => {
            const index = activityData.findIndex(a => a.id === activity.id);
            if (index !== -1) {
                activityData[index] = { ...activityData[index], ...activity };
                filteredActivities = [...activityData];
                renderActivityTable();
                updateOverviewCards();
            }
        });
        
        socket.on('activityDeleted', ({ id }) => {
            activityData = activityData.filter(a => a.id !== id);
            filteredActivities = [...activityData];
            renderActivityTable();
            updateOverviewCards();
            updateLogsCount();
        });
        
        socket.on('newNotification', (notification) => {
            notifications.unshift(notification);
            updateNotificationCount();
            showToast('New notification received!', 'info');
        });
        
        socket.on('notificationRead', ({ id }) => {
            const notification = notifications.find(n => n.id === id);
            if (notification) {
                notification.read_status = true;
                updateNotificationCount();
            }
        });
        
        socket.on('allNotificationsRead', () => {
            notifications.forEach(n => n.read_status = true);
            updateNotificationCount();
        });
        
        socket.on('notificationDeleted', ({ id }) => {
            notifications = notifications.filter(n => n.id !== id);
            updateNotificationCount();
        });
    }
}

async function filterActivities() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    try {
        // Use API filtering instead of client-side filtering for better performance
        const params = {
            limit: 50,
            offset: 0
        };
        
        if (searchTerm) params.search = searchTerm;
        if (typeFilter !== 'all') params.type = typeFilter;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (priorityFilter !== 'all') params.priority = priorityFilter;
        
        filteredActivities = await ecobinAPI.getActivities(params);
        renderActivityTable();
        updateLogsCount();
    } catch (error) {
        console.error('Failed to filter activities:', error);
        showToast('Failed to filter activities', 'error');
    }
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    filteredActivities.sort((a, b) => {
        let aValue, bValue;
        
        switch (column) {
            case 'date_and_time':
                aValue = a.timestamp;
                bValue = b.timestamp;
                break;
            case 'activity_type':
                aValue = a.activityType;
                bValue = b.activityType;
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'priority':
                aValue = a.priority;
                bValue = b.priority;
                break;
            default:
                return 0;
        }
        
        if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderActivityTable();
    updateSortIcons();
}

function updateSortIcons() {
    // Remove all sort icons
    document.querySelectorAll('.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    // Add sort icon to current column
    const currentColumn = document.querySelector(`th.sortable:nth-child(${getColumnIndex(currentSort.column)})`);
    if (currentColumn) {
        const icon = currentColumn.querySelector('i');
        if (icon) {
            icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
    }
}

function getColumnIndex(column) {
    const columnMap = {
        'date_and_time': 1,
        'activity_type': 2,
        'status': 6,
        'priority': 7
    };
    return columnMap[column] || 1;
}

function updateLogsCount() {
    const logsCountElement = document.querySelector('.logs-count');
    if (logsCountElement) {
        logsCountElement.textContent = `${filteredActivities.length} of ${activityData.length} logs`;
    }
}

async function updateOverviewCards() {
    try {
        const stats = await ecobinAPI.getActivityStats();
        
        // Update card numbers
        const alertCard = document.querySelector('.overview-card.alerts .card-number');
        const inProgressCard = document.querySelector('.overview-card.in-progress .card-number');
        const collectionsCard = document.querySelector('.overview-card.collections .card-number');
        const maintenanceCard = document.querySelector('.overview-card.maintenance .card-number');
        
        if (alertCard) alertCard.textContent = stats.alerts;
        if (inProgressCard) inProgressCard.textContent = stats.inProgress;
        if (collectionsCard) collectionsCard.textContent = stats.collections;
        if (maintenanceCard) maintenanceCard.textContent = stats.maintenance;
    } catch (error) {
        console.error('Failed to update overview cards:', error);
        // Fallback to client-side calculation
        const alerts = activityData.filter(a => a.priority === 'urgent' || a.priority === 'high').length;
        const inProgress = activityData.filter(a => a.status === 'in_progress').length;
        const collections = activityData.filter(a => a.activity_type === 'bin_emptied' && a.status === 'done').length;
        const maintenance = activityData.filter(a => a.activity_type === 'maintenance').length;
        
        const alertCard = document.querySelector('.overview-card.alerts .card-number');
        const inProgressCard = document.querySelector('.overview-card.in-progress .card-number');
        const collectionsCard = document.querySelector('.overview-card.collections .card-number');
        const maintenanceCard = document.querySelector('.overview-card.maintenance .card-number');
        
        if (alertCard) alertCard.textContent = alerts;
        if (inProgressCard) inProgressCard.textContent = inProgress;
        if (collectionsCard) collectionsCard.textContent = collections;
        if (maintenanceCard) maintenanceCard.textContent = maintenance;
    }
}

async function updateNotificationCount() {
    try {
        const count = await ecobinAPI.getUnreadNotificationCount();
        const notificationCountElement = document.querySelector('.notification-count');
        if (notificationCountElement) {
            notificationCountElement.textContent = count;
        }
    } catch (error) {
        console.error('Failed to update notification count:', error);
    }
}

// Utility functions
function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options);
}

function getActivityTypeBadge(type) {
    const typeMap = {
        'task_assignment': 'Task Assignment',
        'bin_emptied': 'Bin Emptied',
        'maintenance': 'Maintenance',
        'bin_alert': 'Bin Alert'
    };
    
    const displayName = typeMap[type] || type;
    return `<span class="activity-type-badge ${type}">${displayName}</span>`;
}

function getStatusBadge(status) {
    const statusMap = {
        'pending': 'Pending',
        'in_progress': 'In Progress',
        'done': 'Done'
    };
    
    const displayName = statusMap[status] || status;
    return `<span class="status-badge ${status}">${displayName}</span>`;
}

function getPriorityBadge(priority) {
    const priorityMap = {
        'urgent': 'Urgent',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
    };
    
    const displayName = priorityMap[priority] || priority;
    return `<span class="priority-badge ${priority}">${displayName}</span>`;
}

function formatDetails(details) {
    if (!details || details.length === 0) {
        return '';
    }
    
    return details.map(detail => `<div class="details-item">• ${detail}</div>`).join('');
}

// Add new activity function for demo purposes
function addNewActivity() {
    const newActivity = {
        id: Math.max(...activityData.map(a => a.id)) + 1,
        timestamp: new Date(),
        activityType: 'task_assignment',
        description: {
            main: 'Bin bin2 at University Campus',
            note: 'Scheduled collection required'
        },
        assignedTo: 'Mike Wilson',
        location: 'University Campus',
        status: 'pending',
        priority: 'medium',
        details: ['Level: 70%']
    };
    
    activityData.unshift(newActivity);
    filteredActivities = [...activityData];
    renderActivityTable();
    updateOverviewCards();
    updateLogsCount();
}

// Simulate real-time updates
function startRealTimeUpdates() {
    setInterval(() => {
        // Occasionally add new activities
        if (Math.random() > 0.8) {
            addNewActivity();
        }
        
        // Update overview cards
        updateOverviewCards();
    }, 30000); // Every 30 seconds
}

// Initialize real-time updates
startRealTimeUpdates();

// Export functions for global access
window.addNewActivity = addNewActivity;
window.filterActivities = filterActivities;
window.sortTable = sortTable;

// Add some demo interactions
document.addEventListener('click', function(e) {
    // Handle notification bell click
    if (e.target.closest('.notification-bell')) {
        alert('You have 6 unread notifications!');
    }
    
    // Handle sidebar navigation clicks
    if (e.target.closest('.nav-link') && !e.target.closest('.nav-item.active .nav-link')) {
        e.preventDefault();
        alert('Navigation to other sections would be implemented here.');
    }
    
    // Handle actions button clicks
    if (e.target.closest('.actions-button')) {
        alert('Actions menu would open here with options like Edit, Delete, etc.');
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Add some visual feedback for interactions
document.addEventListener('mouseover', function(e) {
    if (e.target.closest('.overview-card')) {
        e.target.closest('.overview-card').style.transform = 'translateY(-2px)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.closest('.overview-card')) {
        e.target.closest('.overview-card').style.transform = 'translateY(0)';
    }
});

// Toast notification function
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let iconClass = 'fas fa-info-circle';
    let bgColor = '#2196F3';
    
    switch(type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            bgColor = '#4CAF50';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle';
            bgColor = '#f44336';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle';
            bgColor = '#ff9800';
            break;
    }
    
    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${message}</span>
    `;
    
    // Add toast styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-size: 14px;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Console log for debugging
console.log('ECOBIN Activity Monitoring System initialized');
console.log('Available activities:', activityData.length);
console.log('Filtered activities:', filteredActivities.length);

// Task Assignment Modal Functions
function openTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        loadUsersForAssignment();
    }
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetTaskForm();
    }
}

function resetTaskForm() {
    const form = document.getElementById('taskForm');
    if (form) {
        form.reset();
    }
}

// Load users from Firebase for assignment picker
async function loadUsersForAssignment() {
    const assignedToSelect = document.getElementById('assignedTo');
    if (!assignedToSelect) return;
    
    try {
        // Try to get users from API first
        if (typeof ecobinAPI !== 'undefined' && ecobinAPI.getUsers) {
            const users = await ecobinAPI.getUsers();
            populateUserSelect(assignedToSelect, users);
        } else {
            // Fallback to mock users if API is not available
            const mockUsers = [
                { id: '1', name: 'Josh Canillas', email: 'josh.canillas@ecobin.com' },
                { id: '2', name: 'Mike Wilson', email: 'mike.wilson@ecobin.com' },
                { id: '3', name: 'Sarah Johnson', email: 'sarah.johnson@ecobin.com' },
                { id: '4', name: 'David Brown', email: 'david.brown@ecobin.com' },
                { id: '5', name: 'Lisa Garcia', email: 'lisa.garcia@ecobin.com' }
            ];
            populateUserSelect(assignedToSelect, mockUsers);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        // Use mock users as fallback
        const mockUsers = [
            { id: '1', name: 'Josh Canillas', email: 'josh.canillas@ecobin.com' },
            { id: '2', name: 'Mike Wilson', email: 'mike.wilson@ecobin.com' },
            { id: '3', name: 'Sarah Johnson', email: 'sarah.johnson@ecobin.com' },
            { id: '4', name: 'David Brown', email: 'david.brown@ecobin.com' },
            { id: '5', name: 'Lisa Garcia', email: 'lisa.garcia@ecobin.com' }
        ];
        populateUserSelect(assignedToSelect, mockUsers);
    }
}

function populateUserSelect(selectElement, users) {
    // Clear existing options except the first one
    selectElement.innerHTML = '<option value="">Select User</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        selectElement.appendChild(option);
    });
}

// Handle task form submission
document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmission);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeTaskModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeTaskModal();
        }
    });
});

async function handleTaskSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const taskData = {
        activity_type: formData.get('activityType'),
        description: formData.get('description'),
        assigned_to: formData.get('assignedTo'),
        location: formData.get('location'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        due_date: formData.get('dueDate') || null,
        notes: formData.get('notes') || null,
        timestamp: new Date().toISOString()
    };
    
    // Get the assigned user's name
    const assignedToSelect = document.getElementById('assignedTo');
    const selectedOption = assignedToSelect.options[assignedToSelect.selectedIndex];
    const assignedUserName = selectedOption ? selectedOption.textContent : 'Unknown User';
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;
        
        // Try to create task via API
        if (typeof ecobinAPI !== 'undefined' && ecobinAPI.createActivity) {
            const newActivity = await ecobinAPI.createActivity(taskData);
            showToast('Task assignment created successfully!', 'success');
            
            // Refresh the activity list
            await loadActivities();
            renderActivityTable();
            updateOverviewCards();
            updateLogsCount();
        } else {
            // Fallback: create mock activity locally
            const newActivity = {
                id: Date.now().toString(),
                timestamp: new Date(),
                activity_type: taskData.activity_type,
                description_main: taskData.description,
                description_note: taskData.notes || 'No additional notes',
                assigned_to: assignedUserName,
                location: taskData.location,
                status: taskData.status,
                priority: taskData.priority,
                details: taskData.due_date ? [`Due: ${new Date(taskData.due_date).toLocaleDateString()}`] : []
            };
            
            activityData.unshift(newActivity);
            filteredActivities = [...activityData];
            renderActivityTable();
            updateOverviewCards();
            updateLogsCount();
            
            showToast('Task assignment created successfully!', 'success');
        }
        
        closeTaskModal();
        
    } catch (error) {
        console.error('Failed to create task assignment:', error);
        showToast('Failed to create task assignment. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Export modal functions for global access
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;