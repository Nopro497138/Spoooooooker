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
      setUser(j && j.id ? j : null);
    } catch (e) { setUser(null); }
  }

  useEffect(() => {
    fetchUser();
    const t = setInterval(fetchUser, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <nav className="navbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid rgba(255,255,255,0.03)',backdropFilter:'blur(6px)'}}>
      <div style={{display:'flex',alignItems:'center',gap:18}}>
        <Link href="/"><a style={{textDecoration:'none'}}>
          <div style={{fontFamily:'Poppins, Inter, sans-serif',fontWeight:800,letterSpacing:2, background:'linear-gradient(90deg,#ff66b2,#9b59ff)', WebkitBackgroundClip:'text', color:'transparent'}}>SPOOOOOOKER</div>
        </a></Link>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <Link href="/"><a className="muted">Home</a></Link>
          <Link href="/games"><a className="muted">Games</a></Link>
          <Link href="/shop"><a className="muted">Shop</a></Link>
          <Link href="/packs"><a className="muted">Packs</a></Link>
          <Link href="/info"><a className="muted">Info</a></Link>
          {user && user.is_owner ? <Link href="/dev"><a className="owner">Dev</a></Link> : null}
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:14}}>
        {user ? (
          <>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:999,background:'linear-gradient(90deg,#ff9b6b,#d66bff)',color:'#061018',fontWeight:800}}>
              <img src="/images/halloween_candy.png" style={{width:20,height:20}} alt="candy" />
              <div>{user.candy}</div>
            </div>

            <div style={{textAlign:'right',minWidth:160}}>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.65)'}}>Logged in as</div>
              <div style={{fontWeight:800}}>{user.username ? `${user.username}${user.discriminator ? '#'+user.discriminator : ''}` : (user.email || ('User '+(user.id||'')))}</div>
            </div>
          </>
        ) : (
          <>
            <Link href="/auth/discord"><a className="discord">Sign in with Discord</a></Link>
            <Link href="/auth/email"><a className="email">Sign in / Register</a></Link>
          </>
        )}
      </div>

      <style jsx>{`
        .muted { color: rgba(255,255,255,0.75); text-decoration:none; font-weight:600; }
        .owner { color:#b28bff; font-weight:700; text-decoration:none; }
        .discord { background: linear-gradient(90deg,#6b59ff,#8b4cff); color:#fff; padding:8px 12px; border-radius:10px; text-decoration:none; font-weight:700; }
        .email { color: rgba(255,255,255,0.9); padding:8px 10px; border-radius:8px; text-decoration:none; border:1px solid rgba(255,255,255,0.04); font-weight:700; }
      `}</style>
    </nav>
  );
}
