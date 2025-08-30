# Portfolio API & Frontend Application

A full-stack portfolio application built with Node.js, Express, MySQL, and vanilla HTML/CSS/JavaScript. This application provides a complete portfolio management system with a modern, responsive frontend and a robust REST API backend.

## 🌟 Features

### Backend & API
- **Profile Management**: CRUD operations for user profiles (name, email, education, skills, work experience, links)
- **Project Management**: Full project lifecycle with skill associations
- **Skill Management**: Technical skills with proficiency levels and categories
- **Advanced Search**: Global search across all entities with filtering options
- **Health Check**: Liveness endpoint for monitoring
- **Security**: CORS configuration, rate limiting, and helmet security headers

### Database
- **MySQL Database**: Relational database with proper normalization
- **Schema Management**: Automated migrations and seeding
- **Relationships**: Many-to-many relationships between projects, skills, and profiles
- **Performance**: Optimized indexes and views for common queries

### Frontend
- **Modern UI**: Clean, responsive design with CSS Grid and Flexbox
- **Interactive Elements**: Project modals, skill filtering, and search functionality
- **Mobile-First**: Responsive design that works on all devices
- **No Framework**: Built with vanilla JavaScript for performance and simplicity

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   MySQL         │
│   (HTML/CSS/JS) │◄──►│   (Node.js/     │◄──►│   Database      │
│                 │    │    Express)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0+
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon, Environment Variables

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MySQL 8.0+
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd portfolio-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment template and configure your database:
```bash
cp env.example .env
```

Edit `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio_db
DB_PORT=3306
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5000
```

### 4. Database Setup
```bash
# Run migrations to create tables
npm run db:migrate

# Seed the database with sample data
npm run db:seed

# Or run both at once
npm run db:setup
```

### 5. Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`
The frontend will be available at `http://localhost:5000` (you'll need to serve the public folder)

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Health Check
```http
GET /health
```
Returns server health status and uptime information.

#### Profile Management
```http
GET    /profile              # Get profile information
POST   /profile              # Create new profile
PUT    /profile              # Update existing profile
POST   /profile/skills       # Update profile skills
```

#### Projects
```http
GET    /projects             # Get all projects
GET    /projects?skill=python # Filter projects by skill
GET    /projects/:id         # Get specific project
POST   /projects             # Create new project
PUT    /projects/:id         # Update project
DELETE /projects/:id         # Delete project
```

#### Skills
```http
GET    /skills               # Get all skills
GET    /skills/top          # Get top skills by project count
GET    /skills/:id          # Get specific skill
POST   /skills              # Create new skill
PUT    /skills/:id          # Update skill
DELETE /skills/:id          # Delete skill
```

#### Search
```http
GET /search?q=react         # Global search
GET /search/advanced?q=react&type=project&category=Frontend # Advanced search
```

### Request/Response Examples

#### Create Profile
```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "education": "MS Computer Science",
    "github_link": "https://github.com/janedoe",
    "linkedin_link": "https://linkedin.com/in/janedoe"
  }'
```

#### Get Projects by Skill
```bash
curl "http://localhost:3000/api/projects?skill=react"
```

#### Search Projects
```bash
curl "http://localhost:3000/api/search?q=ecommerce&type=project"
```

## 🗄️ Database Schema

### Tables Overview
- **profiles**: User profile information
- **skills**: Technical skills and competencies
- **projects**: Project portfolio items
- **work_experience**: Professional work history
- **project_skills**: Many-to-many relationship between projects and skills
- **profile_skills**: Many-to-many relationship between profiles and skills

### Key Relationships
- One profile can have many skills
- One skill can be used in many projects
- Projects are linked to skills through junction tables
- Work experience is associated with profiles

### Sample Data
The database comes pre-seeded with:
- Sample profile (John Doe)
- 8 technical skills (JavaScript, Python, React, etc.)
- 4 sample projects (E-commerce, Task Manager, Weather App, Portfolio)
- 2 work experience entries

## 🎨 Frontend Features

### Sections
1. **Profile**: Personal information, skills, and work experience
2. **Projects**: Portfolio projects with skill filtering
3. **Skills**: Technical skills with proficiency levels
4. **Search**: Global search with advanced filtering

### Interactive Elements
- **Project Cards**: Click to view detailed project information
- **Skill Filtering**: Filter projects by specific skills
- **Search**: Find projects, skills, or experience by keyword
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Deployment

### Local Development
1. Start MySQL service
2. Configure environment variables
3. Run database setup
4. Start the backend: `npm run dev`
5. Serve frontend files (use any static server)

### Production Deployment

#### Option 1: Traditional Hosting
1. Set up a VPS or cloud server
2. Install Node.js and MySQL
3. Configure environment variables
4. Use PM2 for process management
5. Set up reverse proxy (Nginx/Apache)
6. Configure SSL certificates

#### Option 2: Cloud Platforms
- **Heroku**: Easy deployment with add-ons
- **Railway**: Simple Node.js deployment
- **DigitalOcean App Platform**: Managed Node.js hosting
- **AWS/GCP**: Full control with managed services

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=your-production-db-name
CORS_ORIGIN=https://yourdomain.com
```

## 🧪 Testing

### API Testing
Use the provided Postman collection or test with curl:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test profile endpoint
curl http://localhost:3000/api/profile

# Test search functionality
curl "http://localhost:3000/api/search?q=javascript"
```

### Frontend Testing
- Open the application in different browsers
- Test responsive design on various screen sizes
- Verify all interactive elements work correctly
- Check CORS configuration with your API

## 📁 Project Structure

```
portfolio-api/
├── config/
│   └── database.js          # Database configuration
├── routes/
│   ├── profile.js           # Profile routes
│   ├── projects.js          # Project routes
│   ├── skills.js            # Skill routes
│   └── search.js            # Search routes
├── scripts/
│   ├── migrate.js           # Database migration
│   └── seed.js              # Database seeding
├── public/
│   ├── index.html           # Main frontend page
│   ├── styles.css           # CSS styles
│   └── script.js            # Frontend JavaScript
├── database/
│   └── schema.sql           # Database schema
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
├── env.example              # Environment template
└── README.md                # This file
```

## 🔧 Configuration

### Database Configuration
- **Host**: Database server address
- **Port**: MySQL port (default: 3306)
- **Database**: Database name
- **User**: Database username
- **Password**: Database password

### CORS Configuration
- **Origin**: Allowed frontend origin
- **Credentials**: Enable for authenticated requests
- **Methods**: Allowed HTTP methods

### Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 requests per window per IP

## 🚨 Known Limitations

1. **Authentication**: No user authentication system implemented
2. **File Uploads**: No file upload functionality for project images
3. **Real-time Updates**: No WebSocket implementation for live updates
4. **Caching**: No Redis or in-memory caching implemented
5. **Logging**: Basic console logging only
6. **Testing**: No automated test suite

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] File upload for project images
- [ ] Real-time notifications
- [ ] Advanced analytics and insights
- [ ] API versioning
- [ ] Comprehensive testing suite
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [Your Website](https://yourwebsite.com)

## 📞 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the author directly

---

**Note**: This is a sample portfolio application. Replace the sample data with your actual information before deploying to production.
