# MAPA-Sarap - Restaurant Discovery Platform


## 🚀 Getting Started
- Install dependencies: `npm install`
- Create `.env.local` and set:
	- `DATABASE_URL=your_neon_connection_string`
- Start local app + API: `npm run dev`
- Open: `http://localhost:3000`

## Deploy To GitHub + Vercel
- Push your code to GitHub.
- Import the GitHub repository into Vercel.
- In Vercel Project Settings -> Environment Variables, add:
	- `DATABASE_URL` = your Neon PostgreSQL URL
- Redeploy the project.

## Notes
- Do not commit `.env.local`.
- API routes are available under `/api/*`.

Made with ❤️ for AUF | 2026