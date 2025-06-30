# CodeCollab Backend Server

Backend server for the CodeCollab real-time code editor with Socket.IO support.

## Deploy to Vercel

### Method 1: Using Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Navigate to Server directory**:

   ```bash
   cd Server
   ```

3. **Deploy**:

   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `codecollab-backend` (or any name)
   - Directory: `./` (current directory)
   - Override settings: `N`

### Method 2: Using Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Create New Project**
3. **Import your repository**
4. **Configure**:
   - **Framework Preset**: Node.js
   - **Root Directory**: `Server`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
5. **Deploy**

### Method 3: Using GitHub Integration

1. **Push your code to GitHub**
2. **Go to Vercel Dashboard**
3. **Import from GitHub**
4. **Set Root Directory to `Server`**
5. **Deploy**

## Environment Variables

Set these in your Vercel project dashboard:

- `NODE_ENV`: `production`
- `PORT`: `5000` (optional, Vercel sets this automatically)

## After Deployment

1. **Get your backend URL** from Vercel (e.g., `https://codecollab-backend.vercel.app`)

2. **Update your frontend environment variable**:

   - Go to your frontend Vercel project
   - Settings → Environment Variables
   - Add: `REACT_APP_SERVER_URL` = `https://your-backend-url.vercel.app`

3. **Redeploy your frontend** to pick up the new backend URL

## Local Development

```bash
cd Server
npm install
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

- **WebSocket**: `/socket.io`
- **Health Check**: `/` (returns server status)

## Troubleshooting

- **WebSocket Connection Issues**: Make sure your frontend URL is added to CORS origins in `main.js`
- **Environment Variables**: Ensure `NODE_ENV=production` is set in Vercel
- **Port Issues**: Vercel handles port automatically, don't set PORT environment variable
