
# RoyaleRaffles (Demo)

A clean, modern, and playful raffle site built with **React + Vite + Tailwind**.

- Users can **login/register** (session-only demo; `demo/demo` has $500 preloaded).
- **Wallet**: view balance, **top up**, and see active/ended raffles and wins.
- **Raffles**: list with **filters** (search, category, status, sort).
- **Join**: buy tickets with onsite balance; **per-user cap = 50%** of total tickets.
- **Home**: animated landing + slideshow of top raffles.
- All data persists in localStorage/sessionStorage for demo purposes.

## Quick Start (VS Code)

1. **Download & unzip** this project.
2. Open folder in **VS Code**.
3. Make sure you have Node.js (>=18) installed. Check with:
   ```bash
   node -v
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start dev server:
   ```bash
   npm run dev
   ```
6. Visit the printed URL (usually `http://localhost:5173`). Login using `demo/demo`.

## Tech

- React 18, Vite 5
- Tailwind CSS 3
- React Router v6

## Extend the Project

- Add more pages by creating files in `src/pages` and adding routes in `src/App.jsx`.
- Add real auth/payments by swapping the demo contexts for API calls.
- Add server state by introducing a backend (e.g., Express + DB).

## Notes

- This is a demo and **not** production-ready for payments/real raffles.
- Random winner selection is simulated when a raffle ends (time passes).

