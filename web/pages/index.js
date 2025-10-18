// pages/index.js
import NavBar from '../components/NavBar';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    fetchLeaderboard();
    fetchUser();
    const t1 = setInterval(fetchLeaderboard, 10000);
    const t2 = setInterval(fetchUser, 2500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <>
      <NavBar />
      <main style={{padding:'48px 28px', minHeight:'calc(100vh - 72px)', display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
        <section style={{display:'flex',flexDirection:'column',gap:20}}>
          <div style={{
            background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            border:'1px solid rgba(255,255,255,0.03)',
            borderRadius:16,
            padding:28,
            boxShadow:'0 10px 40px rgba(0,0,0,0.6)'
          }}>
            <h1 style={{margin:0, fontSize:28, color:'#fff'}}>Welcome to <span style={{background:'linear-gradient(90deg,#ff66b2,#9b59ff)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent'}}>SPOOOOOOKER</span></h1>
            <p style={{color:'rgba(255,255,255,0.66)', marginTop:8}}>Spooky arcade — earn <strong>Halloween Candy</strong>, play games and collect packs. Sign in with Discord to get started.</p>

            <div style={{display:'flex',gap:14,marginTop:20,alignItems:'center'}}>
              {user ? (
                <>
                  <Link href="/games"><a className="big-btn">Play Games</a></Link>
                  <Link href="/shop"><a className="ghost-btn">Shop & Packs</a></Link>
                  <div style={{marginLeft:'auto', textAlign:'right'}}>
                    <div style={{color:'rgba(255,255,255,0.7)', fontSize:13}}>Welcome back</div>
                    <div style={{fontWeight:800}}>{user.username ? `${user.username}${user.discriminator ? '#'+user.discriminator : ''}` : ('User '+user.discord_id)}</div>
                  </div>
                </>
              ) : (
                <a href="/api/auth/login" className="big-btn">Sign in with Discord</a>
              )}
            </div>
          </div>

          <div style={{
            display:'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))',
            gap:16
          }}>
            <div className="card">
              <h3>Games</h3>
              <p className="small">Try Planko — drop the ball, try Slot Machine — spin the reels.</p>
              <Link href="/games"><a className="link-inline">Open Games →</a></Link>
            </div>

            <div className="card">
              <h3>Packs</h3>
              <p className="small">Open Packs to get boosts and candy. Some packs require owner confirmation.</p>
              <Link href="/packs"><a className="link-inline">View Packs →</a></Link>
            </div>

            <div className="card">
              <h3>Shop & Coupons</h3>
              <p className="small">Use coupon codes at purchase to get discounts. Coupons are managed by the owner.</p>
              <Link href="/shop"><a className="link-inline">Open Shop →</a></Link>
            </div>
          </div>
        </section>

        <aside>
          <div className="card" style={{padding:18}}>
            <h3>Leaderboard</h3>
            <p className="small">Top candy holders</p>
            <div style={{marginTop:12}}>
              {leaderboard.length === 0 ? <div className="small">No players yet.</div> : (
                <ol style={{paddingLeft:18}}>
                  {leaderboard.map(p => (
                    <li key={p.discord_id} style={{marginBottom:10}}>
                      <div style={{fontWeight:800}}>{p.username || ('User '+p.discord_id)}</div>
                      <div className="small">Candy: {p.candy} • Messages: {p.messages}</div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div style={{height:16}} />

          <div className="card" style={{padding:16,textAlign:'center'}}>
            <h4 style={{marginBottom:6}}>Need help?</h4>
            <div className="small">Visit Info for full instructions and FAQ.</div>
          </div>
        </aside>
      </main>

      <style jsx>{`
        .card {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.03);
          border-radius:12px;
          padding:18px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        }
        .big-btn {
          display:inline-block;
          padding:12px 18px;
          border-radius:12px;
          background: linear-gradient(90deg,#ff7aa3,#9b59ff);
          color:#0b0b14;
          font-weight:800;
          text-decoration:none;
        }
        .ghost-btn {
          display:inline-block;
          padding:10px 14px;
          border-radius:10px;
          background:transparent;
          color:rgba(255,255,255,0.85);
          border:1px solid rgba(255,255,255,0.04);
          text-decoration:none;
        }
        .link-inline { color:#b28bff; text-decoration:none; font-weight:700; }
      `}</style>
    </>
  );
}
