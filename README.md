# Places Application

## Description
An application for viewing and adding interesting places. Users can browse places, leave reviews, and add places to favorites. Administrators can add new places and manage users.

## Project Structure
- **frontend** - React application using Redux for state management
- **backend** - Node.js API server with Express and PostgreSQL

## Technology Stack

### Frontend
- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- JWT for authentication

## Installation and Setup

### Prerequisites
- Node.js
- PostgreSQL

### Database Setup
1. Create a PostgreSQL database
2. Execute the script from the `backend/schema.sql` file

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following parameters:
   ```
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=travelapp
   JWT_SECRET=your_secret_key
   ```
4. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the parameter: `REACT_APP_API_URL=http://localhost:5000/api`
4. Start the application: `npm start`

## Default Users
- Administrator: admin@example.com / admin123
- User: user@example.com / user123

## Main Features
- View list of places
- Filter places by categories
- View detailed information about a place
- Leave reviews
- Add places to favorites
- Administrative panel for managing users and places

## Screenshots
[Screenshots are not available in this version]
