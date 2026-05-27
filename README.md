<div align="center">
  <img src="apps/web/app/icon.png" alt="Formspace Logo" width="100" height="100" />
  
  # FormSpace
  
  **A beautiful, interactive form builder SaaS that feels like it’s from the future!**  
  *Built with 3D Spatial UI, React Three Fiber, tRPC, Zod, Drizzle ORM, and Scalar.*
  
  [![Monorepo: Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444?style=for-the-badge&logo=turbo)](https://turbo.build/)
  [![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
  [![3D Engine: Three.js](https://img.shields.io/badge/3D-Three.js%20%2F%20R3F-049EF4?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
  [![API: tRPC](https://img.shields.io/badge/API-tRPC-390?style=for-the-badge&logo=trpc)](https://trpc.io/)
  [![Database: Drizzle ORM](https://img.shields.io/badge/Database-Drizzle%20ORM-C5F74F?style=for-the-badge&logo=postgresql)](https://orm.drizzle.team/)
  [![Validation: Zod](https://img.shields.io/badge/Validation-Zod-3068B7?style=for-the-badge&logo=zod)](https://zod.dev/)
  [![Docs: Scalar](https://img.shields.io/badge/Docs-Scalar-5E2BFF?style=for-the-badge)](https://scalar.com/)

[🚀 Live Site](https://formspace.mistjs.com/) • [🔑 Demo Account](#-pre-seeded-demo-credentials) • [🛠️ Under the Hood](#%EF%B8%8F-how-the-interactive-3d-works)

</div>

---

> [!IMPORTANT]  
> **Solo Hackathon Project submission.** Formspace is designed to be fully functional, extremely fast, and incredibly fun to play with. Ready for immediate review!

---

## 🎯 What is Formspace?

Formspace is a modern, Typeform-style form builder. Instead of filling out boring, static forms, Formspace turns every form into a visually stunning experience.

Creators can design forms, configure dynamic fields, set passwords, pick creative themes, and check out response charts on a futuristic, glassmorphic dashboard. Respondents can easily fill out forms in gorgeous, mouse-responsive 3D environments without needing an account.

---

## ✨ Features at a Glance

### 🏗️ Core Features

- 🚀 **Full Monorepo Setup**: Front-end (Next.js) and back-end (Express API) run cleanly together in a Turborepo.
- 🔒 **Secure Accounts**: Safe creator login with hashed passwords and persistent sessions.
- 🎨 **Dynamic Form Builder**: Add, edit, remove, and drag questions easily.
- 📝 **Lots of Field Types**: Text, long paragraphs, emails, numbers, dropdown selects, multi-select checkboxes, interactive star ratings, and date pickers.
- 👁️ **Public vs. Unlisted**: Choose to list your forms on our explore page or keep them unlisted so only people with the direct link can find them.
- 📈 **Beautiful Analytics**: See your submission trends, average ratings, choice breakdowns, and a 7-day timeline.
- 📖 **Interactive API Docs**: Built-in Swagger/Scalar API docs for developers.

### 🌟 Extra Fun Stuff

- 🔑 **Password Protection**: Lock your forms with a password. Questions stay hidden until the right password is entered!
- ⏳ **Expiry Timers & Response Limits**: Set an expiration date or limit the number of submissions. The form automatically closes itself once reached.
- 🔀 **Conditional Question Logic**: Show or hide questions based on how people answered previous single-choice questions.
- 🔗 **Custom Form Links (Slugs)**: Customize your form's web link to make it easy to remember.
- ✉️ **Auto Emails**: Sends a beautiful confirmation receipt to respondents and an alert email to you whenever a form is submitted!
- 🛡️ **Spam Protection**: Built-in rate limiter blocks bots from spamming public forms.

---

## 🛠️ How the Interactive 3D Works

We integrated **Three.js** and **React Three Fiber (R3F)** to create high-performance interactive spaces that react to your mouse and scrolling.

Here is exactly how the magic works in simple terms:

### 1. The Dynamic Themes

Every form can be styled with 4 immersive themes:

- **Pure Abstract (The Space-Water Theme)**: A mesh grid acts as a water sheet. Moving your mouse calculates where you are pointing on the screen (using **Raycasting**) and sends ripple waves across the grid. Beneath the water, a field of **4,500 twinkling stars** floats in a cosmic nebula.
- **Manga Pop (The Anime Theme)**: A gorgeous cluster of particles that orbit in soft secondary paths, shifting smoothly as you slide your cursor.
- **Fresh Leaf (The Canopy Theme)**: Green organic nodes that float and wave using gentle wind vectors and spring physics, reacting dynamically to scrolling.
- **Retro Theme**: A grid cloth waving in the wind, mimicking classic 80s synthwave CRT screens.

### 2. Cursor Parallax & Tilting (Spring Physics)

To make the UI feel tactile, we added interactive mouse tilting. When you move your cursor, the form card tilts gently using **spring interpolation**. This calculates a smooth delay (using a physics "spring") between your mouse and the card's rotation. Instead of feeling stiff, it feels soft, responsive, and organic.

### 3. Behind the Scenes: Custom GLSL Shaders

Shaders are mini-programs that run directly on your computer's graphics card (GPU). Instead of asking the browser to calculate the position of thousands of stars or ripples, we wrote custom **GLSL vertex and fragment shaders**. This offloads all calculations to the GPU, keeping CPU usage virtually at 0% and giving you a glassy smooth 60 FPS performance.

### 4. Smart Performance Safeguards

3D graphics can normally make laptops warm. We fixed this with two smart loops:

- **Intersection Observer**: If you scroll down a page and the 3D canvas goes out of view, the loop **immediately freezes**. It only runs when you can actually see it!
- **Page Visibility API**: When you switch browser tabs, the 3D engine pauses instantly to save battery.

---

## 🛠️ Monorepo Structure

Formspace keeps everything organized into neat folders:

```
formspace/
├── apps/
│   ├── api/          # Express API server for tRPC, OpenAPI, and Scalar
│   └── web/          # Next.js frontend with Three.js & R3F graphics
├── packages/
│   ├── database/     # PostgreSQL database connection, Drizzle schemas & seeds
│   ├── trpc/         # Shareable API router definitions
│   ├── services/     # SMTP mail dispatcher for automated email flows
│   └── logger/       # Standard console log configurations
```

---

## 🔑 Pre-Seeded Demo Credentials

Testing Formspace is immediate! We pre-loaded a demonstration account with test surveys and responses so you can check out the charts and dashboard right away without setting anything up:

> [!TIP]
> **Log in with these credentials to explore the dashboard:**
>
> - **Email / Username**: `test@mistjs.com`
> - **Password**: `mist@2434`

---

## 📖 API Reference & Scalar

Formspace automatically converts its tRPC router into standard OpenAPI specifications. Developers can check out endpoints and test them directly in the browser:

- **OpenAPI Specs**: `http://localhost:3001/openapi.json`
- **Interactive Scalar Docs**: `http://localhost:3001/docs`

---

## 🚀 Local Installation & Setup

Want to run Formspace on your machine? It takes less than **3 minutes**:

### 📋 Prerequisites

- **Node.js** (v18+)
- **PNPM** (v8+)
- **PostgreSQL** database (Local or hosted like Neon/Supabase)

### 🛠️ Step-by-Step Run Guide

1. **Clone and Install**

   ```bash
   git clone https://github.com/0nlyjs/formspace.git
   cd formspace
   pnpm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the **root** folder:

   ```env
   # Database connection
   DATABASE_URL="postgresql://postgres:password@localhost:5432/formspace"

   # SMTP Setup (If empty, it automatically runs in offline mock dev mode!)
   SMTP_HOST="smtp.mailtrap.io"
   SMTP_PORT=2525
   SMTP_USER="username"
   SMTP_PASS="password"
   SMTP_FROM="Formspace <noreply@formspace.dev>"

   # Base URL Ports
   BASE_URL="http://localhost:3001"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Initialize Database & Seed Data**
   Drizzle ORM will set up tables, run migrations, and pre-populate your database with demo surveys:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

4. **Launch Dev Mode**
   Start the frontend and backend servers concurrently:

   ```bash
   pnpm dev
   ```

   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:3001](http://localhost:3001)
   - **Scalar API Docs**: [http://localhost:3001/docs](http://localhost:3001/docs)

---

## 🛡️ License

Formspace is open-source under the MIT License. Created as a solo hackathon submission with high-fidelity aesthetics.
