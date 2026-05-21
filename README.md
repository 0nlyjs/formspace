# Formspace

Formspace is a form builder SaaS with support for dynamic fields, themed 3D backgrounds (using Three.js), and automated email flows.

## Tech Stack

- **Monorepo**: Turborepo
- **Frontend**: Next.js, Tailwind CSS, Three.js, Radix UI
- **Backend**: tRPC, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod
- **API Docs**: Scalar

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm

### Installation

1. Clone the repo: `git clone https://github.com/0nlyjs/formspace.git && cd formspace`
2. Install dependencies: `pnpm install`
3. Set up your `.env` file in the root. You'll need a PostgreSQL instance and an SMTP server.

Example `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/formspace
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="Formspace <noreply@formspace.dev>"
BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Initialize the database:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

5. Start dev mode: `pnpm dev`

## Demo Account

Use these for testing the dashboard:

- **Email**: `test@mistjs.com`
- **Password**: `mist@2434`

## API Reference

The API is documented via Scalar. Once the server is running, check: `http://localhost:3001/docs`

## Notes & Gotchas

- Make sure your `BASE_URL` and `NEXT_PUBLIC_APP_URL` are correctly set, otherwise tRPC might have issues with cross-origin requests.
- The 3D backgrounds require WebGL support in the browser.
- If you run into issues with the email service, double-check your SMTP credentials in the `.env` file.
