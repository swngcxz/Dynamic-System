const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ecobin.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'staff',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Activities table
        db.run(`CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME NOT NULL,
            activity_type TEXT NOT NULL,
            description_main TEXT NOT NULL,
            description_note TEXT,
            assigned_to TEXT NOT NULL,
            location TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            details TEXT,
            bin_id TEXT,
            weight REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Notifications table
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            bin_id TEXT,
            read_status BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Bins table
        db.run(`CREATE TABLE IF NOT EXISTS bins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bin_id TEXT UNIQUE NOT NULL,
            location TEXT NOT NULL,
            capacity REAL DEFAULT 100,
            current_weight REAL DEFAULT 0,
            fill_percentage REAL DEFAULT 0,
            status TEXT DEFAULT 'active',
            last_collection DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('✅ Database tables initialized successfully');
    });
};

// Seed initial data
const seedDatabase = () => {
    db.serialize(() => {
        // Check if data already exists
        db.get("SELECT COUNT(*) as count FROM activities", (err, row) => {
            if (err) {
                console.error('Error checking activities:', err);
                return;
            }

            if (row.count === 0) {
                // Insert sample activities
                const activities = [
                    {
                        timestamp: '2025-09-25 01:12:00',
                        activity_type: 'task_assignment',
                        description_main: 'Bin bin1 at Central Plaza',
                        description_note: 'Critical bin level - requires immediate collection',
                        assigned_to: 'Glendon Rose Marie',
                        location: 'Central Plaza',
                        status: 'pending',
                        priority: 'high',
                        details: JSON.stringify(['Level: 85%']),
                        bin_id: 'bin1',
                        weight: 85
                    },
                    {
                        timestamp: '2025-09-25 00:12:00',
                        activity_type: 'bin_emptied',
                        description_main: 'Bin bin1 at Central Plaza',
                        description_note: 'Bin emptied successfully',
                        assigned_to: 'Jeralyn Peritos',
                        location: 'Central Plaza',
                        status: 'done',
                        priority: 'medium',
                        details: JSON.stringify(['Level: 10%', 'Bin: normal']),
                        bin_id: 'bin1',
                        weight: 10
                    },
                    {
                        timestamp: '2025-09-24 23:12:00',
                        activity_type: 'maintenance',
                        description_main: 'Bin bin1 at Central Plaza',
                        description_note: 'Routine maintenance check',
                        assigned_to: 'John Dave Laparan',
                        location: 'Central Plaza',
                        status: 'in_progress',
                        priority: 'low',
                        details: JSON.stringify([]),
                        bin_id: 'bin1',
                        weight: 0
                    },
                    {
                        timestamp: '2025-09-24 22:12:00',
                        activity_type: 'bin_alert',
                        description_main: 'Bin bin1 at Central Plaza',
                        description_note: 'Automated alert: Bin critically full',
                        assigned_to: 'Glendon Rose Marie',
                        location: 'Central Plaza',
                        status: 'in_progress',
                        priority: 'urgent',
                        details: JSON.stringify(['Level: 95%']),
                        bin_id: 'bin1',
                        weight: 95
                    }
                ];

                const stmt = db.prepare(`INSERT INTO activities (
                    timestamp, activity_type, description_main, description_note,
                    assigned_to, location, status, priority, details, bin_id, weight
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

                activities.forEach(activity => {
                    stmt.run([
                        activity.timestamp,
                        activity.activity_type,
                        activity.description_main,
                        activity.description_note,
                        activity.assigned_to,
                        activity.location,
                        activity.status,
                        activity.priority,
                        activity.details,
                        activity.bin_id,
                        activity.weight
                    ]);
                });

                stmt.finalize();
                console.log('✅ Sample activities inserted');
            }
        });

        // Check and insert sample notifications
        db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
            if (err) {
                console.error('Error checking notifications:', err);
                return;
            }

            if (row.count === 0) {
                const notifications = [
                    {
                        title: 'Bin Overflow Alert',
                        message: 'Bin #003 at Shopping Mall has reached 85% capacity and needs immediate attention.',
                        type: 'warning',
                        bin_id: 'bin3'
                    },
                    {
                        title: 'Collection Completed',
                        message: 'Successful collection from Bin #001 at Downtown Plaza. Weight: 45.2kg',
                        type: 'success',
                        bin_id: 'bin1'
                    },
                    {
                        title: 'Sensor Maintenance Required',
                        message: 'Bin #004 at University Campus requires sensor maintenance due to connectivity issues.',
                        type: 'error',
                        bin_id: 'bin4'
                    },
                    {
                        title: 'New Installation',
                        message: 'New bin #005 has been successfully installed at Residential Area and is now active.',
                        type: 'info',
                        bin_id: 'bin5'
                    }
                ];

                const stmt = db.prepare(`INSERT INTO notifications (title, message, type, bin_id) VALUES (?, ?, ?, ?)`);

                notifications.forEach(notification => {
                    stmt.run([
                        notification.title,
                        notification.message,
                        notification.type,
                        notification.bin_id
                    ]);
                });

                stmt.finalize();
                console.log('✅ Sample notifications inserted');
            }
        });

        // Check and insert sample users
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (err) {
                console.error('Error checking users:', err);
                return;
            }

            if (row.count === 0) {
                const bcrypt = require('bcryptjs');
                const users = [
                    {
                        username: 'Josh Canillas',
                        email: 'josh.canillas@ecobin.com',
                        password: 'password123',
                        role: 'admin'
                    },
                    {
                        username: 'Mike Wilson',
                        email: 'mike.wilson@ecobin.com',
                        password: 'password123',
                        role: 'staff'
                    },
                    {
                        username: 'Sarah Johnson',
                        email: 'sarah.johnson@ecobin.com',
                        password: 'password123',
                        role: 'staff'
                    },
                    {
                        username: 'David Brown',
                        email: 'david.brown@ecobin.com',
                        password: 'password123',
                        role: 'staff'
                    },
                    {
                        username: 'Lisa Garcia',
                        email: 'lisa.garcia@ecobin.com',
                        password: 'password123',
                        role: 'staff'
                    }
                ];

                users.forEach(user => {
                    const hashedPassword = bcrypt.hashSync(user.password, 10);
                    db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
                        [user.username, user.email, hashedPassword, user.role]);
                });

                console.log('✅ Sample users inserted');
            }
        });

        // Check and insert sample bins
        db.get("SELECT COUNT(*) as count FROM bins", (err, row) => {
            if (err) {
                console.error('Error checking bins:', err);
                return;
            }

            if (row.count === 0) {
                const bins = [
                    { bin_id: 'bin1', location: 'Central Plaza', capacity: 100, current_weight: 85, fill_percentage: 85 },
                    { bin_id: 'bin2', location: 'Downtown Plaza', capacity: 100, current_weight: 45, fill_percentage: 45 },
                    { bin_id: 'bin3', location: 'Shopping Mall', capacity: 100, current_weight: 95, fill_percentage: 95 },
                    { bin_id: 'bin4', location: 'University Campus', capacity: 100, current_weight: 30, fill_percentage: 30 },
                    { bin_id: 'bin5', location: 'Residential Area', capacity: 100, current_weight: 20, fill_percentage: 20 }
                ];

                const stmt = db.prepare(`INSERT INTO bins (bin_id, location, capacity, current_weight, fill_percentage) VALUES (?, ?, ?, ?, ?)`);

                bins.forEach(bin => {
                    stmt.run([
                        bin.bin_id,
                        bin.location,
                        bin.capacity,
                        bin.current_weight,
                        bin.fill_percentage
                    ]);
                });

                stmt.finalize();
                console.log('✅ Sample bins inserted');
            }
        });
    });
};

// Initialize database
initDatabase();
seedDatabase();

module.exports = db;
