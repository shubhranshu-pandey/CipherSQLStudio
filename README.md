# CipherSQLStudio 🎓

An interactive SQL learning platform that helps users practice and master SQL through hands-on assignments with real-time feedback and AI-powered hints.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

- 📚 **SQL Assignments**: Structured SQL challenges from Easy to Hard difficulty
- 🔄 **Real-time Query Execution**: Execute SQL queries in a sandboxed PostgreSQL environment
- 🤖 **AI-Powered Hints**: Get intelligent hints powered by Groq AI (Llama 3.3) or Google Gemini
- 📊 **Progress Tracking**: Track your learning progress and attempt history
- 🎯 **Interactive SQL Editor**: Monaco-based SQL editor with syntax highlighting
- 🔐 **User Authentication**: Secure JWT-based authentication
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

**Frontend:**

- React 18
- React Router v6
- Axios
- React Query
- Monaco Editor (SQL)
- SCSS/Sass
- Vite

**Backend:**

- Node.js & Express
- MongoDB Atlas (User data, assignments, progress)
- PostgreSQL (SQL execution sandbox)
- JWT Authentication
- Groq AI / Google Gemini AI (Hints)
- Helmet, CORS, Rate Limiting

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker** & **Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Groq API Key** (recommended, for hints) - [Get API Key](https://console.groq.com/)
- **Google Gemini API Key** (alternative option) - [Get API Key](https://makersuite.google.com/app/apikey)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CipherSQLStudio.git
cd CipherSQLStudio
```

### 2. Setup MongoDB Atlas

1. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 3. Setup PostgreSQL with Docker

Start PostgreSQL in a Docker container:

```bash
docker-compose up -d
```

This will:

- Start PostgreSQL on port `5432`
- Automatically initialize the database schema
- Create sample tables for SQL practice

Verify PostgreSQL is running:

```bash
docker ps
```

To stop PostgreSQL:

```bash
docker-compose down
```

### 4. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5002
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority

# PostgreSQL Configuration (Docker)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sqlstudio_sandbox
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sqlstudio_sandbox

# LLM Configuration (Groq - Recommended)
LLM_API_KEY=your_groq_api_key_here
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile

# Alternative: Google Gemini
# LLM_API_KEY=your_gemini_api_key_here
# LLM_PROVIDER=gemini
# LLM_MODEL=gemini-1.5-flash

# Security
JWT_SECRET=your_jwt_secret_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5002/api
VITE_APP_NAME=CipherSQLStudio
VITE_VERSION=1.0.0
```

### LLM Provider Configuration

The platform supports multiple LLM providers for AI-powered hints:

#### Groq (Recommended - Fast & Free Tier Available)

**Available Models:**

- `llama-3.3-70b-versatile` (Recommended - Fast & powerful)
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant` (Faster, lighter)
- `mixtral-8x7b-32768` (Good for long context)
- `gemma2-9b-it`

**Setup:**

1. Get your API key from [console.groq.com](https://console.groq.com/)
2. Set in `.env`:

```env
LLM_API_KEY=gsk_your_groq_api_key
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile
```

#### Google Gemini (Alternative)

**Available Models:**

- `gemini-1.5-flash` (Fast)
- `gemini-1.5-pro` (More capable)
- `gemma-2-9b-it` (Open source)

**Setup:**

1. Get your API key from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Set in `.env`:

```env
LLM_API_KEY=your_gemini_api_key
LLM_PROVIDER=gemini
LLM_MODEL=gemini-1.5-flash
```

## 🏃 Running the Project

### Option 1: Run Everything Separately (Recommended for Development)

**Step 1: Start PostgreSQL**

```bash
docker-compose up -d
```

**Step 2: Start Backend**

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5002`

**Step 3: Seed Database (First Time Only)**

```bash
cd backend
npm run seed
```

**Step 4: Start Frontend**

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Option 2: Production Build

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
CipherSQLStudio/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configurations
│   │   ├── middlewares/     # Express middlewares
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── scripts/         # Database seeding scripts
│   │   └── app.js           # Express app entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── styles/          # Global styles
│   │   └── main.jsx         # React entry point
│   ├── package.json
│   └── .env
├── docker-compose.yml       # PostgreSQL setup
└── README.md
```

## 🌐 Deployment

### Deployed URLs

- **Frontend**: https://cipher-sql-studio-frontend.vercel.app
- **Backend**: https://cipher-sql-studio-wine.vercel.app

### Deploy to Vercel

**Backend:**

```bash
cd backend
vercel --prod
```

Add environment variables in Vercel Dashboard → Settings → Environment Variables

**Frontend:**

```bash
cd frontend
vercel --prod
```

Set `VITE_API_URL` to your backend URL in Vercel environment variables

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

**Backend:**

- All variables from `.env` (MongoDB URI, PostgreSQL credentials, JWT secret, etc.)
- Set `NODE_ENV=production`
- Set `FRONTEND_URL` to your deployed frontend URL

**Frontend:**

- `VITE_API_URL` = Your deployed backend URL

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🛠 Available Scripts

### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample assignments
- `npm test` - Run tests

### Frontend

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# View PostgreSQL logs
docker logs ciphersql-postgres

# Restart PostgreSQL
docker-compose restart
```

### MongoDB Connection Issues

- Verify your MongoDB Atlas connection string
- Check if your IP is whitelisted
- Ensure database user has correct permissions

### Port Already in Use

```bash
# Backend (port 5002)
lsof -ti:5002 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9

# PostgreSQL (port 5432)
lsof -ti:5432 | xargs kill -9
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**CipherSQLStudio Team**

## 🙏 Acknowledgments

- Google Gemini AI for intelligent hints
- MongoDB Atlas for database hosting
- Vercel for deployment platform
- All contributors and supporters

---

**Happy Learning! 🎉**
