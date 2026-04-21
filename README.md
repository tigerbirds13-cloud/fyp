# MERN Stack Application

A full-stack MongoDB, Express, React, and Node.js (MERN) application.

## Project Structure

```
.
├── backend/          # Express.js server and MongoDB integration
├── frontend/         # React application
└── package.json      # Root package.json for managing both client and server
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas connection)

## Installation

### Install all dependencies

```bash
npm install
```

This will install dependencies for both the root, backend, and frontend.

### Install backend dependencies

```bash
cd backend
npm install
```

### Install frontend dependencies

```bash
cd frontend
npm install
```

## Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fyp
NODE_ENV=development
```

## Running the Application

### Development Mode (Both Frontend and Backend)

```bash
npm start
```

This runs both the backend server (port 5000) and frontend development server (port 3000) concurrently.

### Backend Only

```bash
npm run server
```

### Frontend Only

```bash
npm run client
```

### Development with Hot Reload (Backend)

```bash
cd backend
npm run dev
```

## Building for Production

```bash
npm run build
```

This builds the React frontend for production.

## API Endpoints

- `GET /api/health` - Health check endpoint

## Technologies Used

- **Frontend**: React 18, Axios
- **Backend**: Express.js, Mongoose, Node.js
- **Database**: MongoDB
- **Others**: CORS, Body Parser

## Getting Started

1. Start MongoDB service on your machine
2. Navigate to the project root
3. Run `npm install` to install dependencies
4. Run `npm start` to start both frontend and backend
5. Open http://localhost:3000 in your browser

## Notes

- The frontend is configured to proxy API requests to the backend at localhost:5000
- Modify the `proxy` field in `frontend/package.json` if your backend runs on a different port
- Update MongoDB connection string in `backend/.env` as needed

## License

ISC
