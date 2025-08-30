# Deployment Guide

This guide covers deploying the Portfolio API and Frontend to various platforms.

## 🚀 Quick Deployment Options

### Option 1: Railway (Recommended for Beginners)

Railway is a modern platform that makes deploying Node.js apps extremely simple.

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Add a new service** → Select your repo
4. **Add MySQL database** → Railway will automatically set environment variables
5. **Deploy** → Railway will detect it's a Node.js app and deploy automatically

**Environment Variables (Railway will set these automatically):**
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-railway-mysql-host
DB_USER=your-railway-mysql-user
DB_PASSWORD=your-railway-mysql-password
DB_NAME=your-railway-mysql-database
CORS_ORIGIN=https://your-app-name.railway.app
```

### Option 2: Render

Render provides free hosting for Node.js applications.

1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Build Command**: `npm install && npm run db:setup`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. **Add environment variables** (see above)
6. **Deploy**

### Option 3: Heroku

Heroku is a mature platform with excellent Node.js support.

1. **Install Heroku CLI** and sign up
2. **Create a new app**: `heroku create your-app-name`
3. **Add MySQL add-on**: `heroku addons:create jawsdb:kitefin`
4. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-app-name.herokuapp.com
   ```
5. **Deploy**: `git push heroku main`

## 🗄️ Database Setup

### Local Development
```bash
# Install MySQL locally
# On Windows: Download MySQL Installer
# On macOS: brew install mysql
# On Ubuntu: sudo apt install mysql-server

# Start MySQL service
# Windows: Start MySQL service
# macOS: brew services start mysql
# Ubuntu: sudo systemctl start mysql

# Create database and user
mysql -u root -p
CREATE DATABASE portfolio_db;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Update .env file with your credentials
```

### Production Database Options

#### 1. Railway MySQL (Free tier available)
- Automatically managed
- Automatic backups
- Environment variables auto-configured

#### 2. PlanetScale (Free tier available)
- Serverless MySQL
- Automatic scaling
- Branch-based development

#### 3. AWS RDS
- Fully managed MySQL
- High availability
- Automated backups

#### 4. DigitalOcean Managed Databases
- Simple setup
- Good performance
- Reasonable pricing

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Database
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Optional Environment Variables
```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Security
HELMET_ENABLED=true
CORS_CREDENTIALS=true
```

## 📁 Frontend Deployment

### Option 1: Same Domain (Recommended)
Serve the frontend from the same domain as your API:

1. **Update server.js** to serve static files:
```javascript
// Add this after your routes
app.use(express.static('public'));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

2. **Update CORS origin** to match your domain
3. **Update frontend API URL** to use relative paths

### Option 2: Separate Hosting
Deploy frontend to a static hosting service:

#### Netlify (Free)
1. **Connect your GitHub repo**
2. **Build settings**:
   - Build command: `echo "No build needed"`
   - Publish directory: `public`
3. **Deploy**

#### Vercel (Free)
1. **Import your GitHub repo**
2. **Framework preset**: Other
3. **Root directory**: `public`
4. **Deploy**

#### GitHub Pages
1. **Enable GitHub Pages** in your repo settings
2. **Source**: Deploy from a branch
3. **Branch**: Select branch with public folder
4. **Deploy**

## 🚀 Production Deployment Steps

### 1. Prepare Your Application
```bash
# Install dependencies
npm install

# Set NODE_ENV to production
export NODE_ENV=production

# Create production .env file
cp env.example .env
# Edit .env with production values
```

### 2. Database Setup
```bash
# Run migrations
npm run db:migrate

# Seed with your data (optional)
npm run db:seed
```

### 3. Test Locally
```bash
# Test with production environment
NODE_ENV=production npm start

# Test all endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/profile
```

### 4. Deploy
```bash
# Commit all changes
git add .
git commit -m "Production ready"
git push origin main

# Deploy to your chosen platform
# (Follow platform-specific instructions above)
```

### 5. Post-Deployment
```bash
# Test your deployed API
curl https://your-domain.com/health

# Test frontend
# Open your deployed URL in a browser
```

## 🔒 Security Considerations

### 1. Environment Variables
- **Never commit** `.env` files to version control
- Use platform-specific secret management
- Rotate database passwords regularly

### 2. CORS Configuration
```javascript
// Restrict to your domain only
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### 3. Rate Limiting
```javascript
// Adjust based on your needs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 4. HTTPS
- Always use HTTPS in production
- Most platforms provide this automatically
- Configure SSL certificates if self-hosting

## 📊 Monitoring and Maintenance

### 1. Health Checks
```bash
# Monitor your API health
curl https://your-domain.com/health

# Set up uptime monitoring (UptimeRobot, Pingdom)
```

### 2. Logs
```bash
# View application logs
# Railway: railway logs
# Render: render logs
# Heroku: heroku logs --tail
```

### 3. Database Maintenance
```sql
-- Regular maintenance queries
OPTIMIZE TABLE profiles, projects, skills;
ANALYZE TABLE profiles, projects, skills;
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database credentials
# Verify database is running
# Check firewall settings
# Test connection manually
mysql -h your-host -u your-user -p your-database
```

#### 2. CORS Errors
```bash
# Verify CORS_ORIGIN is set correctly
# Check if frontend and backend are on same domain
# Test with browser developer tools
```

#### 3. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
# Kill the process or change port
```

#### 4. Environment Variables Not Loading
```bash
# Verify .env file exists
# Check variable names match exactly
# Restart the application
```

### Getting Help
1. Check the application logs
2. Verify environment variables
3. Test endpoints with curl/Postman
4. Check platform-specific documentation
5. Review the README.md file

## 📈 Scaling Considerations

### 1. Database Scaling
- Use connection pooling (already implemented)
- Consider read replicas for heavy read loads
- Implement caching (Redis) for frequently accessed data

### 2. Application Scaling
- Use PM2 for process management
- Implement load balancing
- Consider microservices architecture

### 3. Performance Optimization
- Add database indexes
- Implement API response caching
- Use CDN for static assets
- Optimize database queries

---

**Remember**: Always test your deployment locally first, and keep your database credentials secure!
