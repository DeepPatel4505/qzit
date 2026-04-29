# Installation Guide

## System Requirements

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher (comes with Node.js)
- **MongoDB**: v4.0 or higher (local or cloud)
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 500MB

## Step-by-Step Installation

### 1. Install Node.js

#### Windows
1. Download from https://nodejs.org/
2. Choose LTS (Long Term Support) version
3. Run installer and follow prompts
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### macOS
```bash
# Using Homebrew
brew install node

# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

### 2. Install MongoDB

#### Option A: Local MongoDB

**Windows**
1. Download from https://www.mongodb.com/try/download/community
2. Run installer with default settings
3. MongoDB will run as a Windows service

**macOS**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu)**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
5. Use this in backend `.env` file

### 3. Clone/Setup Project

```bash
# Navigate to your workspace
cd d:\WebApps\Qzit

# Verify structure
ls  # or 'dir' on Windows
```

### 4. Backend Installation

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# or on macOS/Linux: cp .env.example .env
```

#### Configure Backend .env

Edit `backend/.env`:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/qzit

# For MongoDB Atlas (replace with your credentials)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qzit?retryWrites=true&w=majority

PORT=5000
NODE_ENV=development
```

#### Start Backend

```bash
npm start

# You should see:
# Server running on port 5000
# MongoDB connected successfully
```

### 5. Frontend Installation

**In a new terminal:**

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# or on macOS/Linux: cp .env.example .env
```

#### Configure Frontend .env

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Start Frontend

```bash
npm start

# Browser will automatically open at http://localhost:3000
```

## Verification Checklist

- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:3000
- ✅ MongoDB connection successful (check backend logs)
- ✅ No error messages in console
- ✅ Can see "Create New Quiz" button on page

## Testing the Installation

### Test Backend

```bash
# In a new terminal, test the health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"Server is running"}
```

### Test Frontend

1. Open http://localhost:3000 in your browser
2. You should see "Qzit" header
3. Click "Create New Quiz" button (should work)
4. Try creating a simple quiz to verify everything works

## Troubleshooting

### Error: MongoDB connection failed

**Solution:**
```bash
# Check if MongoDB is running
# Windows: Check Services for MongoDB
# macOS: brew services list
# Linux: sudo systemctl status mongod

# Try local connection first:
# MONGODB_URI=mongodb://localhost:27017/qzit
```

### Error: Port 5000 already in use

**Solution:**
```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Error: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# If still failing, check Node.js version
node --version  # Should be v14+
```

### Error: Dependencies not found

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# or on Windows: rmdir /s node_modules & del package-lock.json

# Reinstall
npm install
```

### Frontend shows blank page

**Solution:**
```bash
# Check frontend console (F12 -> Console tab)
# Check if REACT_APP_API_URL is correct in .env

# Restart frontend:
npm start

# Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

## Development Tools (Optional but Recommended)

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- MongoDB for VS Code
- Thunder Client (for API testing)

### Install VS Code Extensions
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search and install recommended extensions

## Next Steps

1. Read [QUICKSTART.md](./QUICKSTART.md) for quick usage guide
2. Read [README.md](./README.md) for full documentation
3. Create your first quiz!
4. Check [API documentation](./README.md#api-endpoints) for advanced usage

## Getting Help

If you encounter issues:

1. Check troubleshooting section above
2. Check terminal/console error messages
3. Verify all prerequisites are installed
4. Try reinstalling from scratch if needed
5. Check file permissions on uploads folder

## Production Deployment

Once you're comfortable with local setup:
- See [README.md](./README.md#deployment) for deployment instructions
- Use MongoDB Atlas for production database
- Deploy backend to Heroku/Render/Vercel
- Deploy frontend to Vercel/Netlify

---

**Ready? Start with [QUICKSTART.md](./QUICKSTART.md)!** 🚀
