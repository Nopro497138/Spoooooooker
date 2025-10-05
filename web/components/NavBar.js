// web/components/NavBar.js
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (d && d.discord_id) setUser(d);
    }).catch(()=>{});
  }, []);

  return (
    <nav className="nav" style={{ marginBottom: 18 }}>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <div style={{ display:'flex', flexDirection:'column', lineHeight:1 }}>
          <Link href="/"><a style={{ textDecoration:'none', color:'white' }}><strong style={{ fontSize:18, color:'#ffb4ff' }}>spoooooooker</strong></a></Link>
          <span className="small">Galaxy • Halloween</span>
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Link href="/"><a className="small" style={{ color:'var(--muted)', textDecoration:'none' }}>Home</a></Link>
          <Link href="/games"><a className="small" style={{ color:'var(--muted)', textDecoration:'none' }}>Games</a></Link>
          <Link href="/leaderboard"><a className="small" style={{ color:'var(--muted)', textDecoration:'none' }}>Leaderboard</a></Link>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        {user ? (
          <>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>{user.username ? `${user.username}${user.discriminator ? '#' + user.discriminator : ''}` : 'User ' + user.discord_id}</div>
              <div style={{ fontWeight:800, color:'#ffb3b3' }}>{user.points} pts</div>
            </div>
            <Link href="/api/logout"><a className="btn" style={{ background:'linear-gradient(180deg,#ff7a7a,#ff4b4b)', color:'#111' }}>Sign out</a></Link>
          </>
        ) : (
          <a href="/api/auth/login" className="btn" style={{ display:'inline-flex', gap:8, alignItems:'center', background:'linear-gradient(180deg,#6b2eff,#9a5bff)', color:'#fff' }}>
            <svg width="18" height="18" viewBox="0 0 245 240" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>
              <path d="M104.4 0C96.2 0 88.6 1.1 81.5 3.2 82 6.7 83 10 84.3 13 64.3 15.5 46.4 25.2 32.5 40.3 22.7 29 9.7 26.6 0 26.6c0 0 14.2 31 40.8 50-9.6 28.8-9.6 61.8 0 90.6C14.2 204 0 235 0 235c8.1 0 22-2.2 32.8-13.9C46.4 209 64.3 218.6 84.3 221c-1.3 3-2.3 6.3-2.8 9.8 7.1 2.1 14.6 3.2 22.8 3.2 35.7 0 64.6-22 64.6-49 0-1-0.1-2.1-0.1-3.1 10.6-5 20.8-11 30.5-18.6-6.4-2.8-13.1-4.8-20-6-1.7 0.9-3.5 1.7-5.5 2.4C171 201 150 215 125 212c-25-3-43-19-43-19s1.9-1 5.1-2.7c-32.9-4.3-56.2-19-56.2-19 0 0-8.6 1.5-20.3 1.5 6.4-4 12.6-8.6 18.7-13.6C34.9 138.4 23.6 130 23.6 130S52.5 120 78 122.6c3.2-2.1 6.7-4.3 10.4-6.8C78.7 102 71 86 71 86s23.1-13.2 50.1-14.9c4.3-6 9-11.5 14.2-16.6C141.8 58.3 125.9 45 104.4 0z" fill="#fff" />
            </svg>
            <span style={{ fontWeight:800 }}>Sign in with Discord</span>
          </a>
        )}
      </div>
    </nav>
  );
}
