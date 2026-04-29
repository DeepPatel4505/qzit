# Deployment Checklist & Troubleshooting

## Pre-Deployment Checklist

### Local Testing
- [ ] Both backend and frontend run locally
- [ ] Can create a quiz
- [ ] Can upload images
- [ ] Can take a quiz
- [ ] Can view results
- [ ] All pages load without errors
- [ ] Responsive design works on mobile
- [ ] No console errors in browser

### Code Quality
- [ ] Remove console.log statements (optional)
- [ ] Check for hardcoded values
- [ ] Verify environment variables are set
- [ ] Check API endpoints are correct
- [ ] Verify database connection string
- [ ] Test error scenarios

### Backend
- [ ] All API routes working
- [ ] Image upload functional
- [ ] Database queries optimized
- [ ] Error handling in place
- [ ] CORS configured correctly
- [ ] .env file created and not committed

### Frontend
- [ ] All components render correctly
- [ ] API calls working
- [ ] Images loading properly
- [ ] Forms validating
- [ ] Navigation working
- [ ] .env file created

---

## Deployment Steps

### Step 1: Prepare Repository

```bash
# In backend directory
git init
git add .
git commit -m "Initial commit"

# In frontend directory
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Deploy Backend

#### Option A: Deploy to Heroku

1. Create Heroku account at https://www.heroku.com
2. Install Heroku CLI
3. Login: `heroku login`
4. Create app:
   ```bash
   cd backend
   heroku create your-app-name
   ```
5. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   heroku config:set NODE_ENV="production"
   ```
6. Deploy:
   ```bash
   git push heroku main
   ```
7. View app:
   ```bash
   heroku open
   heroku logs --tail
   ```

#### Option B: Deploy to Render

1. Create account at https://render.com
2. Connect GitHub repository
3. Create new Web Service
4. Set environment variables in Render dashboard
5. Deploy

#### Option C: Deploy to Vercel

1. Create account at https://vercel.com
2. Connect GitHub repository
3. Select "backend" folder
4. Set environment variables
5. Deploy

### Step 3: Deploy Frontend

#### Option A: Deploy to Vercel (Recommended)

1. Create account at https://vercel.com
2. Connect GitHub repository
3. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```
4. Deploy

#### Option B: Deploy to Netlify

1. Create account at https://netlify.com
2. Connect GitHub repository
3. Build command: `npm run build`
4. Publish directory: `build`
5. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```
6. Deploy

### Step 4: Configure Database

#### Use MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster (free tier available)
3. Create database user
4. Get connection string
5. Add to backend environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qzit?retryWrites=true&w=majority
   ```

### Step 5: Verify Deployment

- [ ] Backend URL is accessible
- [ ] Frontend URL is accessible
- [ ] API endpoints respond correctly
- [ ] Image upload works
- [ ] Can create quiz
- [ ] Can take quiz
- [ ] Results display correctly

---

## Troubleshooting Guide

### Backend Issues

#### Error: "Cannot find module 'express'"
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Error: "MongoDB connection failed"
```bash
# Check connection string in .env
# Verify MongoDB is running or Atlas cluster is accessible
# Test connection:
mongo "your-connection-string"
```

#### Error: "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

#### Error: "CORS error"
- Verify CORS is enabled in backend
- Check API URL in frontend .env
- Verify frontend URL is allowed in CORS

#### Error: "Image upload fails"
- Check `/uploads` directory exists and is writable
- Verify file size < 5MB
- Check file format (JPEG, PNG, GIF, WebP only)
- Check multer configuration

### Frontend Issues

#### Error: "Cannot GET /api/quizzes"
- Check if backend is running
- Verify `REACT_APP_API_URL` in .env
- Check API endpoint in api.js
- Verify backend deployed correctly

#### Error: "Blank page or white screen"
- Check browser console (F12)
- Check Network tab for failed requests
- Try hard refresh (Ctrl+Shift+R)
- Check if .env file exists

#### Error: "Images not loading"
- Verify image URLs are correct
- Check image file exists in `/uploads`
- Verify CORS allows image requests
- Check file permissions

#### Error: "Cannot read properties of undefined"
- Check API response structure
- Verify backend returns expected data
- Check component props
- Review error logs

### Database Issues

#### Error: "MongoServerError: bad auth"
- Check username and password in connection string
- Verify user exists in MongoDB
- Check permissions for that user
- Verify connection string syntax

#### Error: "Timeout connecting to server"
- Check internet connection
- Verify MongoDB is running (local)
- Check cluster is accessible (Atlas)
- Verify IP whitelist (Atlas)

#### Error: "Collection not found"
- Collections are created automatically
- Submit a quiz to create collections
- Check database name in connection string

### Deployment Issues

#### Backend not starting on Heroku
```bash
heroku logs --tail
# Check output for specific errors
heroku restart
```

#### Frontend not connecting to backend after deploy
- Update `REACT_APP_API_URL` in frontend .env
- Rebuild and redeploy frontend
- Verify backend URL is correct
- Check backend CORS configuration

#### Images not serving in production
- Check file path configuration
- Verify `/uploads` directory is created
- Check file permissions
- Consider using cloud storage (S3, Cloudinary)

---

## Performance Optimization

### Backend
```javascript
// Add pagination for attempts
// Implement caching for frequently accessed quizzes
// Add database indexing
```

### Frontend
```javascript
// Code splitting with React.lazy()
// Image optimization before upload
// Memoization for components
```

### Database
```javascript
// Add indexes to frequently queried fields
db.quizzes.createIndex({ createdAt: -1 })
db.attempts.createIndex({ quizId: 1, completedAt: -1 })
```

---

## Production Recommendations

### Security
- [ ] Use HTTPS only
- [ ] Enable environment variable encryption
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Use prepared statements (prevention)
- [ ] Implement input sanitization
- [ ] Add authentication (JWT)

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add application monitoring (New Relic)
- [ ] Enable database monitoring
- [ ] Track uptime

### Backup
- [ ] Enable MongoDB automated backups
- [ ] Schedule regular exports
- [ ] Test restore procedures
- [ ] Document backup process

### Scaling
- [ ] Enable database replication
- [ ] Use CDN for static assets
- [ ] Implement caching strategy
- [ ] Monitor resource usage

---

## Useful Links

- **Heroku Deployment**: https://devcenter.heroku.com/articles/git
- **Vercel Deployment**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **React Deployment**: https://create-react-app.dev/deployment/
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-performance.html

---

## Support Channels

1. Check project documentation
2. Review error logs
3. Search GitHub issues
4. Check Node.js/React/MongoDB documentation
5. Ask on Stack Overflow
6. Check project sample data

---

## Rollback Procedures

### If deployment fails:

```bash
# Revert to previous version
git revert <commit-hash>
git push

# On Heroku
heroku rollback

# On Vercel
vercel --prod --skip-build
```

---

**Last Updated**: April 26, 2026

For additional help, refer to the main README.md or QUICKSTART.md
