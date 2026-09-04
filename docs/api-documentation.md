# TRUST GRAPH REST API Documentation

Base URL: `/api`

## Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate user & get JWT token
- `GET /api/auth/me` - Get current user profile

## Dashboard
- `GET /api/dashboard` - Get executive KPIs, risk distribution & fairness parity
- `GET /api/dashboard/trends` - Get 7-day risk scoring trends

## Transactions
- `GET /api/transactions` - Paginated transaction search
- `POST /api/transactions/score` - Live risk scoring simulator
- `POST /api/transactions` - Submit new transaction

## Graph Analysis
- `GET /api/graph` - Get full network graph nodes & edges
- `GET /api/graph/clusters` - Get detected suspicious fraud clusters

## Cases & Remediation
- `GET /api/cases` - Get case workbench queue
- `POST /api/cases` - Create fraud case
- `PATCH /api/cases/:id/action` - Apply graduated remediation action
- `PATCH /api/cases/:id/close` - Close case as legitimate

## Appeals
- `POST /api/appeals` - Submit actor appeal
- `PATCH /api/appeals/:id/resolve` - Accept or reject appeal

## Audit & System
- `GET /api/audit` - Append-only log events
- `GET /api/audit/verify` - Run SHA-256 chain verification
- `GET /api/health` - System health check
