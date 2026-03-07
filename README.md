These files of code are the backend of the Landing page for consumers to learn more about the app and
gives them options to download the app, whether it's on the Apple App Store or the Google Play Store.

## Deploying to Vercel (peptideai.co)

1. **Connect the repo** in [Vercel](https://vercel.com): Import `Peptide-AI-Landing-Page`, leave build settings as-is (they’re read from `vercel.json`).
2. **Domain**: In the Vercel project, go to Settings → Domains and add **peptideai.co** (and optionally `www.peptideai.co`).
3. **Routes**: `vercel.json` is set so that:
   - **peptideai.co** and **peptideai.co/waitlist** both serve the app (SPA).
   - All other paths fall back to `index.html` for client-side routing.
4. **Waitlist API (production)**: The app calls `/api/waitlist`. For production you can either:
   - Deploy the Express backend (e.g. Railway or Render), then in `vercel.json` add a rewrite **before** the others:
     `{ "source": "/api/:path*", "destination": "https://YOUR_BACKEND_URL/api/:path*" }`, or
   - Use a Vercel serverless function at `/api/waitlist` that forwards to your backend.
