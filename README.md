# ECOBIN Smart Bin Activity Monitoring System - Full Stack

A complete full-stack web application built with Node.js, Express, SQLite, and Socket.IO that replicates the ECOBIN smart bin monitoring system interface. Features a comprehensive activity logs dashboard with real-time updates, REST API, and database persistence.

## Features

### 🎯 Core Functionality
- **Full-Stack Architecture**: Node.js backend with Express server and SQLite database
- **REST API**: Complete CRUD operations for activities and notifications
- **Real-time Communication**: Socket.IO for live updates and notifications
- **Database Persistence**: SQLite database with proper schema and relationships
- **User Authentication**: JWT-based authentication system
- **ECOBIN Interface**: Professional dark interface with green accent colors
- **Activity Overview Cards**: Four key metrics with real-time data from database
- **Advanced Activity Table**: Comprehensive logs with server-side filtering and search
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices

### 📊 Dashboard Components
- **Activity Overview Cards**: Four key metrics with color-coded icons and real-time counts
- **Advanced Activity Table**: 9-column table with Date & Time, Activity Type, Description, Assigned To, Location, Status, Priority, Details, and Actions
- **Search & Filter System**: Real-time search with dropdown filters for Type, Status, and Priority
- **Sortable Columns**: Click-to-sort functionality on Date & Time, Activity Type, Status, and Priority
- **Notification Bell**: Header notification indicator with count badge

### 🔧 Interactive Features
- **Real-time Search**: Instant filtering as you type in the search box
- **Multi-level Filtering**: Filter by Activity Type, Status, and Priority simultaneously
- **Column Sorting**: Click column headers to sort data ascending/descending
- **Live Data Updates**: Automatic new activity generation every 30 seconds
- **Responsive Navigation**: Collapsible sidebar for mobile devices
- **Keyboard Shortcuts**: Ctrl/Cmd + K to focus search box

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with dark theme
- **Vanilla JavaScript** - Client-side logic
- **Socket.IO Client** - Real-time updates
- **Fetch API** - HTTP requests

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone or navigate to the project directory:**
   ```bash
   cd "D:\deployment project\Static System"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open your browser and go to: `http://localhost:3000`
   - The database will be automatically initialized with sample data

### Production Deployment

1. **Build for production:**
   ```bash
   npm start
   ```

2. **Environment Variables:**
   Create a `.env` file with:
   ```env
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key
   ```

## File Structure

```
Static System/
├── server.js                 # Main Express server
├── package.json              # Dependencies and scripts
├── index.html               # Main HTML structure
├── styles.css               # CSS styling and animations
├── script.js                # Frontend JavaScript
├── database/
│   ├── database.js          # Database setup and models
│   └── ecobin.db            # SQLite database (auto-created)
├── routes/
│   ├── activities.js        # Activity API routes
│   ├── notifications.js     # Notification API routes
│   └── auth.js              # Authentication routes
├── public/
│   └── js/
│       └── api.js           # API client library
└── README.md                # This documentation
```

## How to Use

1. **Open the Application**: Simply open `index.html` in any modern web browser
2. **View Dashboard**: The main dashboard shows overview statistics and real-time status
3. **Monitor Activities**: Use the activity table to view all bin activities
4. **Filter Data**: Use the dropdown filters to narrow down activities by bin or type
5. **View Details**: Click "View" button or activity row to see detailed information
6. **Manage Notifications**: Use notification panel to manage alerts and updates
7. **Refresh Data**: Click the refresh button to manually update all data

## Technical Features

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Modern frosted glass effect with backdrop blur
- **Gradient Backgrounds**: Beautiful color gradients throughout the interface
- **Smooth Animations**: CSS animations for hover effects, transitions, and loading states
- **Responsive Grid**: CSS Grid and Flexbox for optimal layout on all screen sizes

### ⚡ Dynamic Functionality
- **Real-time Simulation**: Simulates live data updates with realistic intervals
- **Data Management**: In-memory data storage with filtering and sorting
- **Event Handling**: Comprehensive event listeners for all interactive elements
- **Modal System**: Custom modal implementation for detailed views

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile devices with touch-friendly interactions
- **Breakpoints**: Responsive design with multiple breakpoints for different screen sizes
- **Touch Gestures**: Optimized for touch interactions on tablets and phones

## Sample Data

The application includes realistic sample data for:
- **Activity Logs**: Collection events, maintenance checks, weight alerts, sensor errors
- **Notifications**: Capacity alerts, collection confirmations, maintenance reminders
- **Statistics**: Dynamic metrics that update based on current data

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Adding New Activity Types
Edit the `activityData` array in `script.js` to add new activity types:

```javascript
const newActivity = {
    id: uniqueId,
    timestamp: new Date(),
    binId: 'bin-xxx',
    activity: 'Your Activity Type',
    weight: weightValue,
    status: 'success|warning|error|info',
    location: 'Location Name',
    operator: 'Operator Name'
};
```

### Styling Modifications
The CSS uses CSS custom properties for easy theming. Modify colors in `styles.css`:

```css
:root {
    --primary-color: #4CAF50;
    --secondary-color: #2196F3;
    --warning-color: #FF9800;
    --error-color: #f44336;
}
```

## Performance Features

- **Efficient Rendering**: Only updates changed elements for optimal performance
- **Data Limiting**: Keeps only recent data to prevent memory issues
- **Smooth Animations**: Hardware-accelerated CSS animations
- **Optimized Images**: Uses Font Awesome icons for crisp, scalable graphics

## Future Enhancements

Potential improvements for future versions:
- Backend integration for real data
- User authentication system
- Data export functionality
- Advanced analytics and charts
- Push notifications
- Offline support with service workers

## License

This project is open source and available under the MIT License.

---

**Note**: This is a static application that simulates real-time functionality. For production use, integrate with actual backend services and APIs.
