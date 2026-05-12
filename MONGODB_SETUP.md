# MongoDB Atlas Setup Guide

## 🔥 Critical: IP Whitelist Configuration

### Step 1: Access MongoDB Atlas
1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Sign in to your account
3. Select your cluster

### Step 2: Configure Network Access
1. Click on **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Select **Allow access from anywhere (0.0.0.0/0)**
4. Click **Confirm**

### Step 3: Verify Database User
1. Go to **Database Access** in the left sidebar
2. Ensure you have a user with read/write permissions
3. Note the username and password

### Step 4: Get Connection String
1. Go to **Database** → **Clusters**
2. Click **Connect** on your cluster
3. Select **Drivers**
4. Copy the connection string

### Step 5: Update Environment Variables

#### In Railway (Backend):
1. Go to your Railway project
2. Click on **Variables** tab
3. Set `MONGO_URI` to:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE_NAME
   ```
4. Replace:
   - `USERNAME` with your MongoDB username
   - `PASSWORD` with your MongoDB password
   - `cluster` with your cluster name
   - `DATABASE_NAME` with your database name (e.g., `spice-route`)

## 🚨 Common Issues & Solutions

### Issue 1: IP Not Whitelisted
**Error**: `Could not connect to any servers in your MongoDB Atlas cluster`
**Solution**: Add `0.0.0.0/0` to IP whitelist as shown above

### Issue 2: Authentication Failed
**Error**: `bad auth` or `Authentication failed`
**Solution**: 
- Verify username and password in MONGO_URI
- Ensure database user exists and has proper permissions
- Check for special characters in password (URL encode if needed)

### Issue 3: Cluster Not Found
**Error**: `ENOTFOUND` or `getaddrinfo`
**Solution**:
- Verify cluster name in connection string
- Ensure cluster is active (not suspended)
- Check if you're using the correct region

### Issue 4: Connection Timeout
**Error**: `timed out` or `connection timeout`
**Solution**:
- Check network connectivity
- Verify cluster is not overloaded
- Try again after a few moments

## 🔍 Testing Connection

Deploy your backend to Railway and check the logs. You should see:
```
✅ MongoDB Connected: cluster.mongodb.net
Database: spice-route
Mongoose connection state: 1
```

If you see connection errors, the logs will now provide specific guidance on what to fix.

## 📋 Environment Variables Checklist

For Railway (Backend):
- [ ] `MONGO_URI` - Full MongoDB connection string
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Railway sets this automatically
- [ ] `FRONTEND_URL` - `https://spice-route-manager.vercel.app`

For Vercel (Frontend):
- [ ] `VITE_API_URL` - `https://spice-route-manager-production.up.railway.app/api`

## 🚀 Deployment Steps

1. Configure MongoDB Atlas (above)
2. Set Railway environment variables
3. Deploy backend to Railway
4. Check Railway logs for MongoDB connection
5. Set Vercel environment variables
6. Deploy frontend to Vercel
7. Test the application

## 🆘 Support

If you still face issues:
1. Check Railway deployment logs
2. Verify MongoDB Atlas cluster status
3. Ensure all environment variables are correctly set
4. Contact support with error logs
