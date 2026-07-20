# GlobalMart — Static Site

This repository contains a static marketing/demo site for GlobalMart.

## Deployment options

### 1) GitHub Pages (quick, free)

- Initialize and push to GitHub (replace `your-repo` as needed):

```bash
git init
git add .
git commit -m "Initial site"
# create remote repo via GitHub web or using gh CLI:
# gh repo create your-username/your-repo --public --source=. --remote=origin --push
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

- Enable Pages in repository settings: set Branch to `main` (root) and save. Alternatively use `gh` CLI to set up Pages.

### 2) Netlify (drag & drop or git)

- Drag-and-drop the project folder on https://app.netlify.com/drop for an instant deploy.
- Or via CLI:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.
```

### 3) Vercel (easy with CLI)

```bash
npm i -g vercel
vercel login
vercel --prod
```

**Notes**

- If you want a custom domain, add a `CNAME` file or configure through your hosting provider.
- A `.nojekyll` file is included to prevent GitHub Pages from ignoring files starting with `_`.

## Backend setup (Prisma, DB, and local dev)

 - Create a `.env` file with a `DATABASE_URL`. For local dev you can use a file-based SQLite URL or a local Postgres instance. 

**PostgreSQL Example:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/globalmart"
ENABLE_HSTS=false
```

**SQLite Example:**
```env
DATABASE_URL="file:./dev.db"
ENABLE_HSTS=false
```

 - Install dependencies and generate Prisma client:

```bash
npm install
npm run prisma:generate
# then create a migration (this will prompt and apply)
npm run prisma:migrate
```

 - Start the server:

```bash
npm start
# Visit http://localhost:3000
```

### Scripts

* `npm run prisma:generate`: Generates the Prisma client based on your schema.
* `npm run prisma:migrate`: Creates and applies database migrations.
* `npm start`: Starts the development server.

**Notes:**
- The server now persists users, sessions, and orders via Prisma. Passwords are hashed with `bcryptjs`.
- You still need to run migrations before auth and checkout endpoints will work.
