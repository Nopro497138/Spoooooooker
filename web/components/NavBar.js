// components/NavBar.js
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // helper: always fetch fresh server-side user (reads httpOnly cookie)
  async function fetchUser() {
    try {
      const res = await fetch('/api/user', { cache: 'no-store' });
      if (!res.ok) { setUser(null); return; }
      const j = await res.json();
      setUser(j && j.discord_id ? j : null);
    } catch (e) {
      setUser(null);
    }
  }

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      if (!res.ok) { setLeaderboard([]); return; }
      const j = await res.json();
      setLeaderboard(j.leaderboard || []);
    } catch (e) {
      setLeaderboard([]);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchLeaderboard();
    // frequent polling to keep UI in sync with server cookie state / in-memory DB
    const t1 = setInterval(fetchUser, 2500);
    const t2 = setInterval(fetchLeaderboard, 9000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Poppins:wght@600;800&display=swap" rel="stylesheet" />
      </Head>

      <nav className="navbar" role="navigation" style={{backdropFilter:'blur(6px)', borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <Link href="/"><a className="logo" style={{textDecoration:'none'}}>
            <div className="brand" style={{
              fontFamily: 'Poppins, Inter, sans-serif',
              fontWeight:800,
              background: 'linear-gradient(90deg,#ff66b2,#9b59ff)',
              WebkitBackgroundClip: 'text',
              backgroundClip:'text',
              color:'transparent',
              letterSpacing: 2
            }}>SPOOOOOOKER</div>
          </a></Link>

          <div style={{display:'flex',gap:14,alignItems:'center'}}>
            <Link href="/"><a className="muted-link">Home</a></Link>
            <Link href="/games"><a className="muted-link">Games</a></Link>
            <Link href="/shop"><a className="muted-link">Shop</a></Link>
            <Link href="/packs"><a className="muted-link">Packs</a></Link>
            <Link href="/info"><a className="muted-link">Info</a></Link>
            {user && user.is_owner ? <Link href="/dev"><a className="accent-link">Dev</a></Link> : null}
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:16}}>
          {user ? (
            <>
              <div className="points-badge" title="Your Halloween Candy" aria-live="polite" style={{display:'flex',alignItems:'center',gap:10}}>
                <img src="/images/halloween_candy.png" alt="candy" className="candy-icon" style={{width:20,height:20}} />
                <div style={{fontWeight:800}}>{user.candy}</div>
              </div>

              <div style={{textAlign:'right',minWidth:170}}>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.65)'}}>Logged in as</div>
                <div style={{fontWeight:800}}>{user.username ? `${user.username}${user.discriminator ? '#'+user.discriminator : ''}` : ('User '+user.discord_id)}</div>
              </div>
            </>
          ) : (
            <a className="discord-btn" href="/api/auth/login" style={{textDecoration:'none',padding:'8px 14px',borderRadius:10,display:'inline-block'}}>Sign in with Discord</a>
          )}
        </div>
      </nav>

      <style jsx>{`
        .muted-link { color: rgba(255,255,255,0.7); text-decoration:none; font-weight:600; font-size:14px; }
        .accent-link { color: #b28bff; text-decoration:none; font-weight:700; font-size:14px; }
        .points-badge { background: linear-gradient(90deg,#ff9b6b,#d66bff); padding:8px 12px; border-radius:999px; color:#071018; font-weight:700; box-shadow:0 6px 18px rgba(0,0,0,0.5); }
        .discord-btn { background: linear-gradient(90deg,#6b59ff,#8b4cff); color:#fff; font-weight:700; border-radius:10px; }
      `}</style>
    </>
  );
}
