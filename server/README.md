# RealWorks Backend API

A Node.js/Express REST API with PostgreSQL database and JWT authentication.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Language**: TypeScript

## Getting Started

### Prerequisites

1. **Node.js 18+** installed
2. **PostgreSQL** database running
3. **npm** or **yarn** package manager

### Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Push database schema:**
   ```bash
   npm run db:push
   ```

5. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/me` | Get current user |
| PATCH | `/api/v1/auth/profile` | Update profile |
| POST | `/api/v1/auth/change-password` | Change password |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | List transactions |
| GET | `/api/v1/transactions/stats` | Get statistics |
| GET | `/api/v1/transactions/:id` | Get transaction |
| POST | `/api/v1/transactions` | Create transaction |
| PATCH | `/api/v1/transactions/:id` | Update transaction |
| DELETE | `/api/v1/transactions/:id` | Delete transaction |

### Savings Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/savings` | List savings goals |
| GET | `/api/v1/savings/:id` | Get savings goal |
| POST | `/api/v1/savings` | Create savings goal |
| PATCH | `/api/v1/savings/:id` | Update savings goal |
| DELETE | `/api/v1/savings/:id` | Delete savings goal |
| POST | `/api/v1/savings/:id/contribute` | Add contribution |

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## Demo Credentials

After running the seed script:

- **Email**: demo@realworks.app
- **Password**: demo123

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_ACCESS_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma     # Database schema
├── src/
│   ├── config/           # Configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities
│   └── index.ts          # Entry point
├── .env                  # Environment variables
├── package.json
└── tsconfig.json
```

## License

MIT
