# Formspace

Formspace is a high-fidelity, production-style form builder SaaS. It allows creators to build dynamic, themed forms with complex validation rules and provides respondents with an immersive, 3D-enhanced experience.

## ✨ Key Features

- **Dynamic Form Builder**: Create forms with various field types including Short/Long Text, Email, Number, Single/Multi-select, Checkbox, Rating, and Date.
- **Advanced Validation**: Powered by Zod for type-safe, robust schema validation for both form structure and respondent answers.
- **Themed Experiences**: Immersive 3D backgrounds with interactive themes such as Anime, Cyberpunk (Tech), and Retro.
- **Visibility Modes**:
  - **Public**: Forms are searchable and listed in the global explore gallery.
  - **Unlisted**: Forms are accessible only via a direct, unique link.
- **Real-time Analytics**: Comprehensive dashboard to track submission counts, field-specific breakdowns (charts), and submission timelines.
- **Automated Email Flows**: Automated notifications for creators upon new submissions and confirmation receipts for respondents.
- **API-First Design**: Fully documented API using Scalar for easy integration.
- **Security & Controls**: Password-protected forms, configurable response limits, and expiration dates.

## 🛠️ Tech Stack

- **Monorepo Management**: [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Three.js](https://threejs.org/), [Radix UI](https://www.radix-ui.com/)
- **Backend & API**: [tRPC](https://trpc.io/), [Express](https://expressjs.com/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)
- **API Documentation**: [Scalar](https://scalar.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/0nlyjs/formspace.git
   cd formspace
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory. You will need to provide credentials for your PostgreSQL database and SMTP server.

   Example variables:

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

4. **Database Initialization**

   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Run Development Mode**
   ```bash
   pnpm dev
   ```

## 🔑 Demo Credentials

Use these credentials to explore the creator dashboard and management features:

- **Email**: `test@mistjs.com`
- **Password**: `mist@2434`

## 📖 API Documentation

The API is fully documented using Scalar. When running the API locally, you can access the documentation at:
`http://localhost:3001/docs`
