# Expense Tracker - Backend

This is the backend service for the Expense Tracker SaaS application. It provides a robust, secure, and scalable RESTful API built with Node.js, Express, and PostgreSQL to handle user authentication, transactions, and financial analytics.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (`pg`)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Security:** Helmet, CORS
- **Task Scheduling:** node-cron
- **Environment Management:** dotenv

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables. Create a `.env` file in the `backend` directory based on your local PostgreSQL setup:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=expense_tracker
   JWT_SECRET=your_jwt_secret_key
   ```

### Database Setup

Run the database migrations to set up the necessary tables (users, transactions, etc.):

```bash
npm run migrate
```

### Running the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## Project Structure

- `src/config/`: Configuration files (e.g., database connection, environment variables).
- `src/controllers/`: Request handlers for API endpoints.
- `src/routes/`: API route definitions.
- `src/models/`: Database queries and data access logic.
- `src/middlewares/`: Express middlewares (e.g., authentication, error handling).
- `src/utils/`: Utility functions and scripts (e.g., database migration).
- `src/services/`: Core business logic (e.g., runway calculation, overspending detection).
- `server.js` / `app.js`: Application entry points.

## Features

- **User Authentication:** Secure registration and login using JWT and bcrypt.
- **Transaction Management:** CRUD operations for user transactions.
- **Financial Analytics:** Intelligent services for calculating financial runway and detecting overspending.
- **Automated Tasks:** Cron jobs for scheduled operations and rule-based nudges.
