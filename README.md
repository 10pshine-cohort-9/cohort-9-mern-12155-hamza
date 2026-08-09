# Notes Application

Full-stack notes app built with Node.js, Express, React, and MySQL.

## Tech Stack

- **Backend:** Node.js, Express, Sequelize, MySQL, Pino Logger
- **Frontend:** React (Vite), React Quill, Axios
- **Testing:** Mocha/Chai (backend), Jest (frontend)
- **Code Quality:** SonarQube

## Project Structure

```text
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/         # DB and logger configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Error handler, auth, validation
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities (AppError)
│   │   ├── app.js          # Express app setup
│   │   └── index.js        # Entry point
│   └── test/               # Mocha/Chai tests
├── client/                 # React frontend (Vite)
└── sonar-project.properties
```

## Getting Started

### Backend

```bash
cd server
cp .env.example .env       # configure your DB credentials
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```
