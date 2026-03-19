// This file provides a single source of truth for the backend API URL.
// It uses Vite's environment variable `VITE_API_URL`.
// You can create a `.env.local` file in the `frontend` directory with:
// VITE_API_URL=http://localhost:3000
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";