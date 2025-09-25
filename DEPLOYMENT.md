# ECOBIN Dynamic System - Deployment Guide

## 🚀 Deployment to Coolify

### Prerequisites
- GitHub repository with your code
- Coolify instance running
- Domain name (optional)

### Step-by-Step Deployment Process

#### 1. GitHub Repository Setup
Your repository is already set up at: `https://github.com/swngcxz/Dynamic-System.git`

#### 2. Coolify Configuration

**In Coolify Dashboard:**

1. **Create New Project**
   - Click "New Project"
   - Choose "Git Repository"
   - Connect your GitHub repository

2. **Application Settings**
   - **Name**: `ecobin-dynamic-system`
   - **Description**: `ECOBIN Smart Bin Monitoring System with Task Assignment`
   - **Build Pack**: `Nixpacks` (auto-detects Node.js)
   - **Static Site**: ❌ Unchecked (this is a Node.js app)

3. **Build Configuration**
   - **Install Command**: `npm install`
   - **Build Command**: (leave empty - no build step needed)
   - **Start Command**: `npm start`

4. **Environment Variables**
   Add these environment variables in Coolify:
   ```
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

5. **Domain Configuration**
   - **Primary Domain**: Your custom domain (e.g., `ecobin.yourdomain.com`)
   - **Generate Domain**: Let Coolify generate a subdomain if needed

#### 3. Database Setup

**Option A: Use SQLite (Simple)**
- The app includes SQLite database with sample data
- No additional setup required

**Option B: Use External Database (Recommended for Production)**
- Set up PostgreSQL or MySQL
- Update database connection in `database/database.js`

#### 4. Firebase Configuration

Update `public/js/firebase-config.js` with your production Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-production-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

#### 5. Deploy

1. Click **"Deploy"** in Coolify
2. Monitor the build logs
3. Wait for deployment to complete
4. Test your application

### Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Task assignment modal works
- [ ] User dropdown populates correctly
- [ ] API endpoints respond properly
- [ ] Real-time updates work via Socket.IO
- [ ] Database operations function correctly

### Troubleshooting

**Common Issues:**

1. **Build Fails**
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json

2. **Application Won't Start**
   - Check environment variables
   - Verify PORT is set correctly
   - Check server logs in Coolify

3. **Database Issues**
   - Ensure database file has proper permissions
   - Check database path in configuration

4. **Firebase Errors**
   - Verify Firebase configuration
   - Check API keys and project settings

### Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate secrets regularly

2. **CORS Configuration**
   - Set specific origins in production
   - Don't use wildcard (*) in production

3. **Database Security**
   - Use connection pooling
   - Implement proper authentication
   - Regular backups

### Monitoring and Maintenance

1. **Logs**
   - Monitor application logs in Coolify
   - Set up error tracking

2. **Performance**
   - Monitor response times
   - Check database performance
   - Optimize queries if needed

3. **Updates**
   - Regular dependency updates
   - Security patches
   - Feature updates

### Support

For issues or questions:
- Check Coolify documentation
- Review application logs
- Test locally first
- Use version control for rollbacks
