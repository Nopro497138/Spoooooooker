// web/pages/index.js
// Minimal Next.js page to satisfy Vercel's build requirements.
// This file fixes the "Couldn't find any `pages` or `app` directory" build error.

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg,#070708,#0f0f11)',
      color: '#e6e6e6',
      fontFamily: 'Inter, system-ui, Roboto, Arial, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: 900,
        width: '100%',
        padding: 28,
        borderRadius: 12,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.03)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#ff5f5f', margin: 0 }}>Halloween Galaxy — Planko</h1>
        <p style={{ color: 'rgba(230,230,230,0.85)' }}>
          This repository's web build expects a Next.js app. A minimal <code>/pages</code> entry point has been added so Vercel can build the site.
        </p>
        <p style={{ color: 'rgba(230,230,230,0.7)' }}>
          If you intend to serve the single-file Express app (app.js) on a separate host, keep using that server; this Next.js page only exists to satisfy Vercel's build process.
        </p>
      </div>
    </main>
  );
}
