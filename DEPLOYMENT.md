# 🚀 Deployment Guide for CodeCollab

This guide will help you deploy both the frontend and backend of CodeCollab to Vercel.

## 📋 Prerequisites

1. **GitHub Account** - For version control
2. **Vercel Account** (Recommended) - For easy full-stack deployment
3. **Node.js** - For local development and testing

## 🎯 Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Update the vercel.json file** (already created) with your actual domain:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "Client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       },
       {
         "src": "Server/main.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/Server/main.js"
       },
       {
         "src": "/(.*)",
         "dest": "/Client/$1"
       }
     ]
   }
   ```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `cd Client && npm install && npm run build`
   - Output Directory: `Client/build`
5. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `REACT_APP_SERVER_URL` = `https://your-app-name.vercel.app`
6. **Click "Deploy"**

### Step 3: Update CORS Settings

After deployment, update the CORS origins in `Server/main.js`:

```javascript
origin: process.env.NODE_ENV === 'production'
  ? ['https://your-actual-app-name.vercel.app']
  : ["http://localhost:3000", "http://localhost:5000"],
```

## 🌐 Option 2: Deploy to Railway

### Step 1: Prepare for Railway

1. **Create a `railway.json` file:**

   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "node Server/main.js",
       "healthcheckPath": "/",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

2. **Update package.json in root:**
   ```json
   {
     "name": "codecollab",
     "version": "1.0.0",
     "scripts": {
       "build": "cd Client && npm install && npm run build",
       "start": "node Server/main.js",
       "dev": "concurrently \"cd Server && npm run dev\" \"cd Client && npm start\""
     },
     "dependencies": {
       "concurrently": "^7.0.0"
     }
   }
   ```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Add environment variables:**
   - `NODE_ENV` = `production`
   - `REACT_APP_SERVER_URL` = `https://your-app-name.railway.app`
4. **Deploy**

## ☁️ Option 3: Deploy to Heroku

### Step 1: Prepare for Heroku

1. **Create a `Procfile` in the root:**

   ```
   web: node Server/main.js
   ```

2. **Create `heroku-postbuild` script in root package.json:**
   ```json
   {
     "scripts": {
       "heroku-postbuild": "cd Client && npm install && npm run build"
     }
   }
   ```

### Step 2: Deploy to Heroku

1. **Install Heroku CLI**
2. **Login to Heroku:**
   ```bash
   heroku login
   ```
3. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```
4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set REACT_APP_SERVER_URL=https://your-app-name.herokuapp.com
   ```
5. **Deploy:**
   ```bash
   git push heroku main
   ```

## 🔧 Option 4: Deploy to DigitalOcean App Platform

### Step 1: Prepare for DigitalOcean

1. **Create `app.yaml` file:**
   ```yaml
   name: codecollab
   services:
     - name: web
       source_dir: /
       github:
         repo: yourusername/your-repo-name
         branch: main
       run_command: node Server/main.js
       build_command: cd Client && npm install && npm run build
       environment_slug: node-js
       instance_count: 1
       instance_size_slug: basic-xxs
   ```

### Step 2: Deploy to DigitalOcean

1. **Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)**
2. **Create a new app**
3. **Connect your GitHub repository**
4. **Configure the app using the app.yaml**
5. **Deploy**

## 🐳 Option 5: Deploy with Docker

### Step 1: Create Dockerfile

```dockerfile
# Multi-stage build
FROM node:16-alpine AS client-builder
WORKDIR /app/client
COPY Client/package*.json ./
RUN npm ci --only=production
COPY Client/ ./
RUN npm run build

FROM node:16-alpine AS server-builder
WORKDIR /app/server
COPY Server/package*.json ./
RUN npm ci --only=production
COPY Server/ ./

FROM node:16-alpine
WORKDIR /app
COPY --from=client-builder /app/client/build ./client/build
COPY --from=server-builder /app/server ./server
COPY --from=server-builder /app/server/node_modules ./server/node_modules

EXPOSE 5000
CMD ["node", "server/main.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: "3.8"
services:
  codecollab:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
```

### Step 3: Deploy

```bash
docker build -t codecollab .
docker run -p 5000:5000 codecollab
```

## 🔍 Post-Deployment Checklist

### ✅ Environment Variables

- [ ] `NODE_ENV` = `production`
- [ ] `REACT_APP_SERVER_URL` = your production URL
- [ ] `PORT` = your server port (usually 5000)

### ✅ CORS Configuration

- [ ] Update CORS origins in `Server/main.js`
- [ ] Test WebSocket connections
- [ ] Verify real-time functionality

### ✅ Testing

- [ ] Test room creation and joining
- [ ] Test real-time code collaboration
- [ ] Test code execution (JavaScript, Python, etc.)
- [ ] Test user disconnection handling

### ✅ Performance

- [ ] Check build size optimization
- [ ] Verify static file serving
- [ ] Test WebSocket connection stability

## 🚨 Common Issues & Solutions

### Issue 1: WebSocket Connection Failed

**Solution:** Update CORS origins and ensure WebSocket transport is enabled.

### Issue 2: Build Fails

**Solution:** Check Node.js version compatibility and ensure all dependencies are installed.

### Issue 3: Environment Variables Not Working

**Solution:** Ensure environment variables are properly set in your deployment platform.

### Issue 4: Static Files Not Serving

**Solution:** Verify the build directory path and static file middleware configuration.

## 📞 Support

If you encounter any issues during deployment:

1. **Check the deployment logs** in your platform's dashboard
2. **Verify environment variables** are correctly set
3. **Test locally** with production environment variables
4. **Check CORS configuration** for your specific domain

## 🎉 Success!

Once deployed, your real-time code editor will be available at your production URL. Share it with your team and start collaborating on code in real-time!

## Backend Deployment (Already Done)

Your backend is already deployed at: `https://server-6qvgas4on-mithilesh11705s-projects.vercel.app`

## Frontend Deployment

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Create New Project**
3. **Import your GitHub repository**
4. **Configure the project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `Client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
5. **Click Deploy**

### Method 2: Using Vercel CLI

1. **Navigate to the project root**:

   ```bash
   cd Real_Time-Code_Editor
   ```

2. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

3. **Deploy**:

   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `codecollab-frontend` (or any name)
   - Directory: `./` (current directory)
   - Override settings: `N`

## Environment Variables Setup

After deploying the frontend, you need to set the backend URL:

1. **Go to your frontend Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add new environment variable**:
   - **Name**: `REACT_APP_SERVER_URL`
   - **Value**: `https://server-6qvgas4on-mithilesh11705s-projects.vercel.app`
   - **Environment**: Production
4. **Click Save**

## Redeploy Frontend

After setting the environment variable:

1. **Go to your frontend Vercel project dashboard**
2. **Click "Redeploy"** to pick up the new environment variable

## Testing the Deployment

1. **Open your frontend URL** (e.g., `https://codecollab-frontend.vercel.app`)
2. **Create a room** with a username
3. **Open another browser window/tab** and join the same room
4. **Start typing** - you should see real-time collaboration working

## Troubleshooting

### WebSocket Connection Issues

If you see WebSocket connection errors:

1. **Check the backend URL** in environment variables
2. **Verify the backend is running** by visiting: `https://server-6qvgas4on-mithilesh11705s-projects.vercel.app`
3. **Check browser console** for specific error messages

### Environment Variable Issues

If the frontend can't connect to the backend:

1. **Verify the environment variable is set correctly**
2. **Redeploy the frontend** after setting environment variables
3. **Check that the variable name is exactly**: `REACT_APP_SERVER_URL`

### Build Issues

If the build fails:

1. **Check the build logs** in Vercel dashboard
2. **Verify all dependencies** are in `Client/package.json`
3. **Test locally** with `npm run build` in the Client directory

## URLs Summary

- **Backend**: `https://server-6qvgas4on-mithilesh11705s-projects.vercel.app`
- **Frontend**: `https://your-frontend-url.vercel.app` (after deployment)

## Local Development

To test locally:

1. **Start backend**:

   ```bash
   cd Server
   npm install
   npm start
   ```

2. **Start frontend**:
   ```bash
   cd Client
   npm install
   npm start
   ```

The frontend will automatically connect to `http://localhost:5000` in development mode.
