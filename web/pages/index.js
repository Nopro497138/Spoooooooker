// web/pages/index.js
// Full-featured frontend page for the Halloween Galaxy site.
// Uses the API routes above for OAuth, user info, playing Planko and leaderboard.
// This file replaces the minimal placeholder and provides a polished, responsive UI.

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
        // update local user points quickly
        setUser(prev => prev ? ({ ...prev, points: data.newPoints }) : prev);
        // refresh leaderboard
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
      <div style={{ width: '100%', maxWidth: 1100, display:'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <section style={{ padding: 24, borderRadius: 12, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.04)' }}>
          <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
            <div>
              <h1 style={{ margin:0, color:'#ff5f5f' }}>Halloween Galaxy — Planko</h1>
              <p style={{ margin: '6px 0 0', color:'rgba(230,230,230,0.8)' }}>A spooky, free arcade — use Halloween Points earned on Discord to play Planko.</p>
            </div>
            <div style={{ textAlign:'right' }}>
              {user ? (
                <>
                  <div style={{ fontSize:14, color:'rgba(255,255,255,0.75)' }}>Logged in as</div>
                  <div style={{ fontWeight:800, fontSize:16 }}>{user.username ? `${user.username}${user.discriminator ? '#' + user.discriminator : ''}` : 'User ' + user.discord_id}</div>
                  <div style={{ color:'#ffb3b3', marginTop:6 }}>Points: <strong style={{ color:'#ff5f5f' }}>{user.points}</strong></div>
                  <a href="/api/logout" style={{ display:'inline-block', marginTop:8, textDecoration:'none', fontSize:13, color:'rgba(200,200,200,0.8)' }}>Sign out</a>
                </>
              ) : (
                <a href="/api/auth/login" style={{ display:'inline-block', padding:'10px 14px', borderRadius:10, background:'linear-gradient(180deg,#ff7a7a,#ff4b4b)', color:'#111', fontWeight:700, textDecoration:'none' }}>Sign in with Discord</a>
              )}
            </div>
          </header>

          <article style={{ marginTop: 6 }}>
            <h2 style={{ margin:'8px 0' }}>How Planko works</h2>
            <p style={{ color:'rgba(230,230,230,0.75)' }}>
              Place a bet in Halloween Points and press Play. The random roll decides your outcome:
              <ul style={{ color:'rgba(230,230,230,0.7)' }}>
                <li>70% Lose (you lose your bet)</li>
                <li>20% Small win (1.5x)</li>
                <li>7% Nice win (2x)</li>
                <li>3% Jackpot (5x)</li>
              </ul>
            </p>

            <div style={{ marginTop: 12, padding:12, borderRadius:10, background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <input type="number" value={bet} min={1} onChange={e=>setBet(Number(e.target.value))} style={{ padding:'10px', borderRadius:8, background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'#fff', width:140 }} />
                <button onClick={play} disabled={loading} style={{ padding:'10px 16px', borderRadius:10, background:'linear-gradient(180deg,#ff8b8b,#ff5252)', border:'none', fontWeight:700, cursor:'pointer' }}>
                  {loading ? 'Playing...' : 'Play Planko'}
                </button>
                <div style={{ marginLeft:'auto', color:'rgba(230,230,230,0.85)' }}>Your points: <strong style={{ color:'#ff5f5f' }}>{user ? user.points : 0}</strong></div>
              </div>

              {result && (
                <div style={{ marginTop:12, padding:12, borderRadius:8, background:'rgba(0,0,0,0.35)' }}>
                  {result.error ? (
                    <div style={{ color:'#ff9b9b' }}><strong>Error:</strong> {result.error}</div>
                  ) : (
                    <>
                      <div><strong>Outcome:</strong> {result.outcome}</div>
                      <div><strong>Multiplier:</strong> {result.multiplier}x</div>
                      <div><strong>Change:</strong> {(result.change >= 0 ? '+' : '') + result.change} points</div>
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
                <li>This demo uses a local SQLite DB on the server host.</li>
              </ul>
            </section>
          </article>
        </section>

        <aside style={{ padding: 20, borderRadius: 12, background: 'linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin:0 }}>Leaderboard</h3>
            <p style={{ margin:'6px 0 12px', color:'rgba(230,230,230,0.7)' }}>Top players by points</p>
            <div style={{ display:'grid', gap:8 }}>
              {leaderboard.length === 0 ? <div style={{ color:'rgba(230,230,230,0.6)' }}>No players yet</div> : leaderboard.map((u,i) => (
                <div key={u.discord_id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px', borderRadius:8, background:'rgba(0,0,0,0.25)' }}>
                  <div style={{ fontSize:14 }}>{i+1}. <strong style={{ color:'#fff' }}>{u.username}{u.discriminator ? '#' + u.discriminator : ''}</strong></div>
                  <div style={{ color:'#ffb3b3' }}>{u.points} pts</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop:20 }}>
            <h4 style={{ margin:'0 0 8px' }}>Quick actions</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <a href={user ? '/api/auth/logout' : '/api/auth/login'} style={{ padding:'10px', borderRadius:8, textAlign:'center', background:'rgba(255,255,255,0.02)', color:'#fff', textDecoration:'none' }}>
                {user ? 'Sign out' : 'Sign in with Discord'}
              </a>
              <a href="https://github.com/Nopro497138/Spoooooooker" target="_blank" rel="noreferrer" style={{ padding:'10px', borderRadius:8, textAlign:'center', background:'rgba(255,255,255,0.02)', color:'#fff', textDecoration:'none' }}>
                View repo
              </a>
            </div>
          </div>

          <footer style={{ marginTop:20, color:'rgba(230,230,230,0.6)', fontSize:13 }}>
            Built with spooky vibes • Halloween Galaxy
          </footer>
        </aside>
      </div>
    </main>
  );
}
