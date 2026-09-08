# ArchiveMe 📦

Lightweight, clean, and modern Personal Media Storage Web Application (Photos & Videos) designed with a strict **mobile-first Apple/Linear aesthetic**.

Built with **Bun**, **Next.js App Router**, **Tailwind CSS**, **Turso (LibSQL) + Drizzle ORM**, **Backblaze B2 S3 storage**, and a **Master Passcode / PIN Auth Gate**.

---

## ✨ Features

- **📱 Mobile-First UX:** 44x44px minimum touch targets, sticky bottom action bar, thumb-reachable FAB.
- **📂 Full Folder & Media CRUD:** Create, rename, move, and safe cascading delete (purges physical B2 files and Turso records).
- **🎬 In-Browser Lightbox Player:** Native hardware-accelerated HTML5 `<video controls playsinline>` and full-res photo viewer with swipe/keyboard navigation.
- **⚡ Direct Cloud Uploads:** Direct client-to-B2 PUT via S3 Presigned URLs (bypassing Vercel's 4.5MB serverless payload limit) with live progress tracking.
- **📥 Direct Downloads:** Download files directly with `Content-Disposition: attachment; filename="name.ext"` headers.
- **🔒 Master Passcode Gate:** Protected by Next.js Middleware with zero external dependencies (native Web Crypto HMAC-SHA256).
- **🚀 Ultra-Lightweight & Fast:** Zero cold-start latency with LibSQL / Turso on Vercel.

---

## 🛠️ Tech Stack

- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Framework:** [Next.js (App Router, React 19, TypeScript)](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database & ORM:** [Turso (LibSQL)](https://turso.tech/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Cloud Storage:** [Backblaze B2 S3](https://www.backblaze.com/cloud-storage) via `@aws-sdk/client-s3`

---

## 🚀 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kotoamatsukami0/archiveme.git
   cd archiveme
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Turso database credentials, Backblaze B2 keys, and your custom `APP_PASSWORD`.

4. **Sync database schema:**
   ```bash
   bun run db:push
   ```

5. **Start development server:**
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. In the **Environment Variables** section, add:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `B2_KEY_ID`
   - `B2_APPLICATION_KEY`
   - `B2_BUCKET_NAME`
   - `B2_ENDPOINT`
   - `B2_REGION`
   - `APP_PASSWORD`
4. Click **Deploy**.
