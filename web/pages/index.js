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
      setUser(j && j.id ? j : null);
    } catch (e) { setUser(null); }
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
      <main style={{padding:'46px 28px', minHeight:'calc(100vh - 72px)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
          <section style={{display:'flex',flexDirection:'column',gap:18}}>
            <div style={{padding:28, borderRadius:14, background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border:'1px solid rgba(255,255,255,0.03)', boxShadow:'0 8px 40px rgba(0,0,0,0.6)'}}>
              <h1 style={{margin:0, fontSize:28}}>Welcome to <span style={{background:'linear-gradient(90deg,#ff66b2,#9b59ff)',WebkitBackgroundClip:'text',color:'transparent'}}>SPOOOOOOKER</span></h1>
              <p style={{color:'rgba(255,255,255,0.7)', marginTop:8}}>A modern spooky arcade — play games, earn <strong>Halloween Candy</strong>, open packs and collect rewards.</p>

              <div style={{display:'flex',gap:12,marginTop:18,alignItems:'center'}}>
                <Link href="/games"><a style={{padding:'12px 16px', borderRadius:12, background:'linear-gradient(90deg,#ff7aa3,#9b59ff)', color:'#081018', fontWeight:800}}>Play Games</a></Link>
                <Link href="/shop"><a style={{padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.04)', color:'#fff', textDecoration:'none'}}>Shop & Packs</a></Link>
                <div style={{marginLeft:'auto'}}>
                  {user ? <div style={{fontWeight:800}}>Welcome back{user.username ? `, ${user.username}` : ''}</div> : <div className="small">Sign in to start earning candy</div>}
                </div>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
              <div style={{padding:18,borderRadius:12,background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.03)'}}>
                <h3 style={{marginTop:0}}>Planko</h3>
                <p className="small">Drop the ball into multipliers — skill+luck.</p>
                <Link href="/games/planko"><a className="link-inline">Play Planko →</a></Link>
              </div>

              <div style={{padding:18,borderRadius:12,background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.03)'}}>
                <h3 style={{marginTop:0}}>Slot Machine</h3>
                <p className="small">Spin 3 reels — match emojis to win.</p>
                <Link href="/games/slot"><a className="link-inline">Play Slot →</a></Link>
              </div>

              <div style={{padding:18,borderRadius:12,background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.03)'}}>
                <h3 style={{marginTop:0}}>Packs</h3>
                <p className="small">Open themed packs for boosts and candy.</p>
                <Link href="/packs"><a className="link-inline">Open Packs →</a></Link>
              </div>
            </div>
          </section>

          <aside style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{padding:18,borderRadius:12,background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.03)'}}>
              <h3 style={{marginTop:0}}>Leaderboard</h3>
              <p className="small">Top candy holders</p>
              <div style={{marginTop:12}}>
                {leaderboard.length === 0 ? <div className="small">No players yet.</div> : (
                  <ol style={{paddingLeft:18}}>
                    {leaderboard.map(p => (
                      <li key={p.id} style={{marginBottom:10}}>
                        <div style={{fontWeight:800}}>{p.username || (p.email || ('User '+p.id))}</div>
                        <div className="small">Candy: {p.candy} • Messages: {p.messages}</div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            <div style={{padding:18,borderRadius:12,background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.03)',textAlign:'center'}}>
              <h4 style={{margin:0}}>Need help?</h4>
              <div className="small" style={{marginTop:8}}>Visit Info for full instructions and FAQ.</div>
            </div>
          </aside>
        </div>
      </main>

      <style jsx>{`
        .small { color: rgba(255,255,255,0.72); }
        .link-inline { color:#b28bff; font-weight:700; text-decoration:none; }
      `}</style>
    </>
  );
}
