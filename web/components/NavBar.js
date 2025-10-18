// components/NavBar.js
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const [user, setUser] = useState(null);

  async function fetchUser() {
    try {
      const res = await fetch('/api/user', { cache: 'no-store' });
      if (!res.ok) { setUser(null); return; }
      const j = await res.json();
      setUser(j && (j.id || j.discord_id) ? j : null);
    } catch (e) { setUser(null); }
  }

  useEffect(() => {
    fetchUser();
    const t = setInterval(fetchUser, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <nav className="navbar" role="navigation">
      <div className="nav-left">
        <Link href="/"><a className="brand-link">SPOOOOOOKER</a></Link>

        <div className="nav-links">
          <Link href="/"><a className="nav-link">Home</a></Link>
          <Link href="/games"><a className="nav-link">Games</a></Link>
          <Link href="/shop"><a className="nav-link">Shop</a></Link>
          <Link href="/packs"><a className="nav-link">Packs</a></Link>
          <Link href="/info"><a className="nav-link">Info</a></Link>
          {user && user.is_owner ? <Link href="/dev"><a className="nav-link owner">Dev</a></Link> : null}
        </div>
      </div>

      <div className="nav-right">
        {user ? (
          <div className="user-block" aria-live="polite">
            <div className="points-badge" title="Your Halloween Candy">
              <img src="/images/halloween_candy.png" alt="candy" className="candy-icon" />
              <span className="points-value">{user.candy}</span>
            </div>

            <div className="user-name">
              <div className="small-muted">Logged in as</div>
              <div className="user-id">{user.username ? `${user.username}${user.discriminator ? '#'+user.discriminator : ''}` : (user.email || 'User')}</div>
            </div>
          </div>
        ) : (
          <div className="auth-links">
            <Link href="/auth/discord"><a className="btn discord">Sign in with Discord</a></Link>
            <Link href="/auth/email"><a className="btn ghost">Sign in / Register</a></Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .navbar{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:12px 20px;
          gap:16px;
          position:sticky;
          top:0;
          z-index:100;
          backdrop-filter: blur(6px);
          background: linear-gradient(180deg, rgba(11,8,15,0.65), rgba(6,6,10,0.5));
          border-bottom: 1px solid rgba(255,255,255,0.02);
        }
        .brand-link{
          font-family: 'Poppins', Inter, sans-serif;
          font-weight:800;
          letter-spacing:2px;
          background: linear-gradient(90deg,#ff66b2,#9b59ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-decoration:none;
          font-size:18px;
        }
        .nav-links{ display:flex; gap:12px; align-items:center; margin-left:14px; }
        .nav-link{ color: rgba(255,255,255,0.72); text-decoration:none; font-weight:600; font-size:14px; padding:6px 8px; border-radius:8px; }
        .nav-link:hover{ color:#fff; background: rgba(255,255,255,0.02); }
        .owner{ color: #caaaff !important; }
        .nav-left{ display:flex; align-items:center; gap:8px; }
        .nav-right{ display:flex; align-items:center; gap:12px; }
        .auth-links{ display:flex; gap:10px; align-items:center; }
        .btn{ padding:8px 12px; border-radius:10px; text-decoration:none; font-weight:700; }
        .btn.discord{ background: linear-gradient(90deg,#6b59ff,#8b4cff); color:#fff; }
        .btn.ghost{ border:1px solid rgba(255,255,255,0.06); color:rgba(255,255,255,0.9); background:transparent; }
        .user-block{ display:flex; align-items:center; gap:12px; }
        .points-badge{ display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; background: linear-gradient(90deg,#ff9b6b,#d66bff); color:#061018; font-weight:800; }
        .candy-icon{ width:20px; height:20px; display:block; }
        .points-value{ font-weight:800; }
        .user-name{ text-align:right; min-width:140px; }
        .small-muted{ font-size:12px; color: rgba(255,255,255,0.65); }
        .user-id{ font-weight:800; }
      `}</style>
    </nav>
  );
}
