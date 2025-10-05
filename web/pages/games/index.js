// web/pages/games/index.js
import NavBar from '../../components/NavBar';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Games() {
  const [user, setUser] = useState(null);
  useEffect(()=> {
    fetch('/api/user').then(r=>r.json()).then(d => { if (d && d.discord_id) setUser(d); });
  }, []);

  if (!user) {
    return (
      <div className="container">
        <NavBar />
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <h3 style={{ color:'#ffb4ff' }}>Sign in to access Games</h3>
          <a href="/api/auth/login" className="btn" style={{ background:'linear-gradient(180deg,#6b2eff,#9a5bff)', color:'#fff' }}>Sign in with Discord</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <NavBar />
      <div className="card">
        <h2 style={{ marginTop:0, color:'#ffb4ff' }}>Games</h2>
        <p className="small">Choose a game. Each game uses your Halloween Points.</p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:12 }}>
          <Link href="/games/planko"><a className="btn">Planko</a></Link>
          <Link href="/games/slot"><a className="btn">Slot Machine</a></Link>
        </div>
      </div>
    </div>
  );
}
