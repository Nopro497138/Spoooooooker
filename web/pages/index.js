// web/pages/index.js
// Upgraded, responsive, touch-friendly frontend optimized for iPad and mobile.
// This replaces the previous page with a fully responsive layout and better UX.

import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [bet, setBet] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(data => {
      if (data && data.discord_id) setUser(data);
    }).catch(() => {});
    fetch('/api/leaderboard').then(r => r.json()).then(j => setLeaderboard(j.leaderboard || [])).catch(()=>{});
  }, []);

  async function play() {
    setResult(null);
    if (!user) {
      window.location.href = '/api/auth/login';
      return;
    }
    const b = Number(bet) || 0;
    if (b <= 0) {
      alert('Please enter a valid bet.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/planko', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ bet: b })
      });
      const data = await res.json();
      if (data.error) {
        setResult({ error: data.error });
      } else {
        setResult(data);
        setUser(prev => prev ? ({ ...prev, points: data.newPoints }) : prev);
        const lb = await fetch('/api/leaderboard').then(r => r.json()).then(j => j.leaderboard || []);
        setLeaderboard(lb);
      }
    } catch (err) {
      setResult({ error: 'Unexpected error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 8% 12%, rgba(255,80,80,0.08), transparent 6%), radial-gradient(circle at 92% 88%, rgba(255,80,80,0.06), transparent 8%), linear-gradient(180deg,#070708,#0f0f11)',
      color: '#e6e6e6',
      fontFamily: 'Inter, system-ui, Roboto, Arial, sans-serif',
      padding: '28px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: 1200 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 20,
          alignItems: 'start'
        }}>
          <section style={{
            padding: 24,
            borderRadius: 12,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)'
          }}>
            <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 auto', minWidth: 220 }}>
                <h1 style={{ margin:0, color:'#ff5f5f', fontSize: 28 }}>Halloween Galaxy — Planko</h1>
                <p style={{ margin: '6px 0 0', color:'rgba(230,230,230,0.8)' }}>A spooky, free arcade — use Halloween Points earned on Discord to play Planko.</p>
              </div>

              <div style={{ textAlign:'right', minWidth: 180 }}>
                {user ? (
                  <>
                    <div style={{ fontSize:14, color:'rgba(255,255,255,0.75)' }}>Logged in as</div>
                    <div style={{ fontWeight:800, fontSize:16 }}>{user.username ? `${user.username}${user.discriminator ? '#' + user.discriminator : ''}` : 'User ' + user.discord_id}</div>
                    <div style={{ color:'#ffb3b3', marginTop:6 }}>Points: <strong style={{ color:'#ff5f5f' }}>{user.points}</strong></div>
                    <a href="/api/logout" style={{ display:'inline-block', marginTop:10, padding:'8px 10px', borderRadius:10, textDecoration:'none', color:'#111', background:'rgba(255,255,255,0.06)', fontSize:13 }}>Sign out</a>
                  </>
                ) : (
                  <a href="/api/auth/login" style={{ display:'inline-block', padding:'12px 18px', borderRadius:12, background:'linear-gradient(180deg,#ff7a7a,#ff4b4b)', color:'#111', fontWeight:800, textDecoration:'none', fontSize:15 }}>Sign in with Discord</a>
                )}
              </div>
            </header>

            <article style={{ marginTop: 6 }}>
              <h2 style={{ margin:'8px 0', fontSize:20 }}>How Planko works</h2>
              <p style={{ color:'rgba(230,230,230,0.75)', lineHeight:1.5 }}>
                Place a bet in Halloween Points and press Play. The random roll decides your outcome:
              </p>
              <ul style={{ color:'rgba(230,230,230,0.75)', marginTop:8, marginBottom:12 }}>
                <li>70% — Lose (you lose your bet)</li>
                <li>20% — Small win (1.5x)</li>
                <li>7% — Nice win (2x)</li>
                <li>3% — Jackpot (5x)</li>
              </ul>

              <div style={{ marginTop: 12, padding:16, borderRadius:12, background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                  <label htmlFor="bet" style={{ display:'block', color:'rgba(230,230,230,0.8)', fontSize:14 }}>Bet</label>
                  <input id="bet" inputMode="numeric" type="number" value={bet} min={1} onChange={e=>setBet(Number(e.target.value))} style={{ padding:'12px', borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'#fff', width:140, fontSize:16 }} />
                  <button onClick={play} disabled={loading} style={{ padding:'12px 18px', borderRadius:12, background:'linear-gradient(180deg,#ff8b8b,#ff5252)', border:'none', fontWeight:800, cursor:'pointer', fontSize:16 }}>
                    {loading ? 'Playing...' : 'Play Planko'}
                  </button>
                  <div style={{ marginLeft:'auto', color:'rgba(230,230,230,0.85)', fontSize:15 }}>Your points: <strong style={{ color:'#ff5f5f' }}>{user ? user.points : 0}</strong></div>
                </div>

                {result && (
                  <div style={{ marginTop:14, padding:12, borderRadius:10, background:'rgba(0,0,0,0.35)' }}>
                    {result.error ? (
                      <div style={{ color:'#ff9b9b' }}><strong>Error:</strong> {result.error}</div>
                    ) : (
                      <>
                        <div style={{ marginBottom:6 }}><strong>Outcome:</strong> {result.outcome}</div>
                        <div style={{ marginBottom:6 }}><strong>Multiplier:</strong> {result.multiplier}x</div>
                        <div style={{ marginBottom:6 }}><strong>Change:</strong> {(result.change >= 0 ? '+' : '') + result.change} points</div>
                        <div><strong>New balance:</strong> {result.newPoints}</div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <section style={{ marginTop:18 }}>
                <h3 style={{ marginBottom:8 }}>Tips & notes</h3>
                <ul style={{ color:'rgba(230,230,230,0.75)' }}>
                  <li>Earn 1 Halloween Point every 50 messages on Discord where the bot is present.</li>
                  <li>Your Discord account is linked only to track points and display username.</li>
                  <li>This demo uses a local SQLite DB on the server host (data persists on the host).</li>
                </ul>
              </section>
            </article>
          </section>

          <aside style={{
            padding: 20,
            borderRadius: 12,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.03)',
            height: 'fit-content',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
          }}>
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ margin:0, fontSize:18 }}>Leaderboard</h3>
              <p style={{ margin:'6px 0 12px', color:'rgba(230,230,230,0.7)' }}>Top players by points</p>
              <div style={{ display:'grid', gap:8 }}>
                {leaderboard.length === 0 ? <div style={{ color:'rgba(230,230,230,0.6)' }}>No players yet</div> : leaderboard.map((u,i) => (
                  <div key={u.discord_id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px', borderRadius:10, background:'rgba(0,0,0,0.25)' }}>
                    <div style={{ fontSize:14 }}>{i+1}. <strong style={{ color:'#fff' }}>{u.username}{u.discriminator ? '#' + u.discriminator : ''}</strong></div>
                    <div style={{ color:'#ffb3b3', fontWeight:700 }}>{u.points} pts</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop:20 }}>
              <h4 style={{ margin:'0 0 8px' }}>Quick actions</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <a href={user ? '/api/logout' : '/api/auth/login'} style={{ padding:'12px', borderRadius:10, textAlign:'center', background:'rgba(255,255,255,0.02)', color:'#fff', textDecoration:'none', fontWeight:700 }}>
                  {user ? 'Sign out' : 'Sign in with Discord'}
                </a>
                <a href="https://github.com/Nopro497138/Spoooooooker" target="_blank" rel="noreferrer" style={{ padding:'12px', borderRadius:10, textAlign:'center', background:'rgba(255,255,255,0.02)', color:'#fff', textDecoration:'none', fontWeight:700 }}>
                  View repo
                </a>
              </div>
            </div>

            <footer style={{ marginTop:20, color:'rgba(230,230,230,0.6)', fontSize:13 }}>
              Built with spooky vibes • Halloween Galaxy
            </footer>
          </aside>
        </div>
      </div>

      {/* Responsive adjustments */}
      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1fr 360px"] {
            grid-template-columns: 1fr 320px !important;
          }
        }
        @media (max-width: 820px) {
          div[style*="grid-template-columns: 1fr 360px"] {
            grid-template-columns: 1fr !important;
          }
          aside {
            order: 2;
            margin-top: 16px;
          }
        }
        @media (max-width: 480px) {
          a[style*="Sign in with Discord"] {
            padding: 14px 18px !important;
            font-size: 16px !important;
          }
          input#bet {
            width: 100% !important;
          }
          button {
            width: 100% !important;
          }
        }
      `}</style>
    </main>
  );
}
