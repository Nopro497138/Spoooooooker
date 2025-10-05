// web/pages/index.js
import NavBar from '../components/NavBar';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  useEffect(()=> {
    fetch('/api/user').then(r=>r.json()).then(d => { if (d && d.discord_id) setUser(d); });
  }, []);

  return (
    <div className="container">
      <NavBar />
      <div style={{ display:'grid', gridTemplateColumns: '1fr 340px', gap:18 }}>
        <main className="card">
          {!user ? (
            <div style={{ textAlign:'center', padding:40 }}>
              <h2 style={{ color:'#ffb4ff' }}>Welcome to spoooooooker</h2>
              <p className="small">Sign in with Discord to access Games (Planko, Slot Machine) and your points.</p>
              <div style={{ marginTop:18 }}>
                <a href="/api/auth/login" className="btn" style={{ background:'linear-gradient(180deg,#6b2eff,#9a5bff)', color:'#fff' }}>Sign in with Discord</a>
              </div>
            </div>
          ) : (
            <>
              <h2 style={{ marginTop:0, color:'#ffb4ff' }}>Hello {user.username ? `${user.username}${user.discriminator ? '#' + user.discriminator : ''}` : 'Player'}</h2>
              <p className="small">Welcome back — your current balance: <strong style={{ color:'#ffb3b3' }}>{user.points}</strong> Halloween Points.</p>

              <section style={{ marginTop:16 }}>
                <h3 style={{ marginBottom:8 }}>Play</h3>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <Link href="/games/planko"><a className="btn">Planko</a></Link>
                  <Link href="/games/slot"><a className="btn">Slot Machine</a></Link>
                </div>
              </section>

              <section style={{ marginTop:18 }}>
                <h3 style={{ marginBottom:8 }}>About</h3>
                <p className="small">spoooooooker is a spooky galaxy-themed arcade. Earn points on Discord by chatting (bot awards 1 point per 50 messages) and spend them here to play fun games.</p>
              </section>
            </>
          )}
        </main>

        <aside>
          <div className="card">
            <h4 style={{ marginTop:0 }}>Leaderboard</h4>
            <Leaderboard />
          </div>

          <div className="card" style={{ marginTop:12 }}>
            <h4 style={{ marginTop:0 }}>Quick Links</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <Link href="/games"><a className="btn" style={{ textDecoration:'none' }}>Open Games</a></Link>
              <a href="https://github.com/Nopro497138/Spoooooooker" target="_blank" rel="noreferrer" className="small">Repository</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Leaderboard() {
  const [list, setList] = useState([]);
  useEffect(()=> {
    fetch('/api/leaderboard').then(r=>r.json()).then(j => setList(j.leaderboard || []));
  }, []);
  return (
    <div>
      {list.length === 0 ? <div className="small">No players yet</div> : list.slice(0,10).map((u,i)=> (
        <div key={u.discord_id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize:14 }}>{i+1}. <strong>{u.username}</strong></div>
          <div style={{ color:'#ffb3b3' }}>{u.points}</div>
        </div>
      ))}
    </div>
  );
}
