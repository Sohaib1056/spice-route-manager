# DryFruit Pro - Premium Dry Fruits Store

Ek modern aur responsive dry fruits e-commerce website built with React, Vite, and Tailwind CSS.

## Features

- 🏠 **Dashboard/Home Page** - Featured products showcase
- 🛍️ **Products Page** - Complete product listing with filters and sorting
- 📱 **Product Detail Page** - Detailed product information
- 🛒 **Shopping Cart** - Full cart functionality
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Modern UI** - Clean and professional design
- ⚡ **Fast Performance** - Built with Vite

## Tech Stack

- **React 19** - UI Library
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router DOM** - Routing
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Deployment on Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect Vite settings
6. Click "Deploy"

### Environment Variables (if needed)

Agar aapko environment variables chahiye, Vercel dashboard mein add karein:
- Go to Project Settings
- Navigate to Environment Variables
- Add your variables

## Project Structure

```
Dryfruitwebsite/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── context/        # React Context (Cart)
│   ├── data/           # Static data (products)
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── vercel.json         # Vercel configuration
└── vite.config.js      # Vite configuration
```

## Available Routes

- `/` - Home/Dashboard page
- `/products` - All products page
- `/product/:id` - Product detail page
- `/cart` - Shopping cart page

## Build Output

Build files will be generated in the `dist/` directory.

## Support

For any issues or questions, please contact support.

---

Made with ❤️ for premium dry fruits lovers
