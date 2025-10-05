// web/pages/games/planko.js
import NavBar from '../../components/NavBar';
import { useEffect, useState, useRef } from 'react';

export default function Planko() {
  const [user, setUser] = useState(null);
  const [bet, setBet] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const ballRef = useRef();

  useEffect(()=> {
    fetch('/api/user').then(r=>r.json()).then(d => { if (d && d.discord_id) setUser(d); });
  }, []);

  async function play() {
    if (!user) return window.location.href = '/api/auth/login';
    if (bet <= 0 || isNaN(bet)) return alert('Enter a valid bet');
    setPlaying(true);
    setResult(null);

    try {
      const resp = await fetch('/api/planko', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ bet }) });
      const data = await resp.json();
      if (data.error) {
        setResult({ error: data.error });
        setPlaying(false);
        return;
      }
      // animate ball falling to bucket based on data.bucket (0..3)
      animateBallToBucket(data.bucket).then(() => {
        setResult(data);
        setUser(prev => prev ? ({ ...prev, points: data.newPoints }) : prev);
        setPlaying(false);
      });
    } catch (err) {
      setResult({ error: 'Unexpected error' });
      setPlaying(false);
    }
  }

  function animateBallToBucket(bucketIndex) {
    // simplistic CSS animation: move ball top -> buckets (4 buckets)
    return new Promise(resolve => {
      const el = ballRef.current;
      if (!el) return resolve();
      el.style.transition = 'transform 1.2s cubic-bezier(.2,.9,.2,1)';
      // compute translate based on bucket index
      const xBase = [-120, -40, 40, 120];
      el.style.transform = `translate(${xBase[bucketIndex]}px, 220px) scale(0.9)`;
      setTimeout(() => {
        // bounce
        el.style.transition = 'transform 0.35s cubic-bezier(.2,.9,.2,1)';
        el.style.transform = `translate(${xBase[bucketIndex]}px, 190px) scale(0.95)`;
        setTimeout(() => {
          el.style.transition = '';
          el.style.transform = `translate(0px, 0px)`;
          resolve();
        }, 350);
      }, 1250);
    });
  }

  if (!user) {
    return (
      <div className="container">
        <NavBar />
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <h3 style={{ color:'#ffb4ff' }}>Sign in to play Planko</h3>
          <a href="/api/auth/login" className="btn" style={{ background:'linear-gradient(180deg,#6b2eff,#9a5bff)', color:'#fff' }}>Sign in with Discord</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <NavBar />
      <div style={{ display:'grid', gridTemplateColumns: '1fr 360px', gap:18 }}>
        <div className="card">
          <h2 style={{ marginTop:0, color:'#ffb4ff' }}>Planko</h2>
          <p className="small">A ball drops from the top and lands in one of the multiplier buckets. Choose your bet and good luck!</p>

          <div style={{ display:'flex', gap:12, alignItems:'center', marginTop:12 }}>
            <input type="number" value={bet} min={1} onChange={e=>setBet(Number(e.target.value))} style={{ padding:'10px', borderRadius:8, background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'#fff', width:120 }} />
            <button onClick={play} className="btn" disabled={playing} style={{ background: 'linear-gradient(180deg,#ff8b8b,#ff5252)', color:'#111' }}>{playing ? 'Playing...' : 'Play'}</button>
            <div style={{ marginLeft:'auto' }} className="small">Your points: <strong style={{ color:'#ffb3b3' }}>{user.points}</strong></div>
          </div>

          <div style={{ marginTop:20, height:320, position:'relative', overflow:'hidden' }}>
            {/* plinko board */}
            <div style={{ width:'100%', height:'100%', borderRadius:8, background:'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))', position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'center' }}>
              <div style={{ width:360, height:'100%', position:'relative' }}>
                {/* pegs as dots */}
                {Array.from({length:36}).map((_,i)=> {
                  const r = (i%6);
                  const x = 20 + r*56 + ((i%2)?28:0);
                  const y = 20 + Math.floor(i/6)*22;
                  return <div key={i} style={{ position:'absolute', left: x+'px', top:y+'px', width:6, height:6, borderRadius:6, background:'rgba(255,255,255,0.12)' }} />;
                })}

                {/* buckets at bottom */}
                <div style={{ position:'absolute', bottom:6, left:12, right:12, height:80, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  {['x0','x1.5','x2','x5'].map((t,i)=> (
                    <div key={i} style={{ width:72, height:76, borderRadius:6, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                      <div style={{ fontSize:18, fontWeight:800, color: i===3 ? '#ffcf99' : '#fff' }}>{t}</div>
                      <div className="small" style={{ marginTop:6 }}>{['Lose','Small','Nice','Jackpot'][i]}</div>
                    </div>
                  ))}
                </div>

                {/* falling ball (absolutely positioned) */}
                <div ref={ballRef} style={{ position:'absolute', left:'50%', transform:'translate(-50%, 0)', top:12, width:20, height:20, borderRadius:20, background:'#ffd1d1', boxShadow:'0 6px 16px rgba(255,0,0,0.12)', transition:'transform 0.3s' }} />
              </div>
            </div>
          </div>

          {result && (
            <div style={{ marginTop:14, padding:12, borderRadius:8, background:'rgba(0,0,0,0.35)' }}>
              {result.error ? <div style={{ color:'#ff9b9b' }}><strong>Error:</strong> {result.error}</div> :
                <>
                  <div><strong>Outcome:</strong> {result.outcome}</div>
                  <div><strong>Multiplier:</strong> {result.multiplier}x</div>
                  <div><strong>Change:</strong> {(result.change >= 0 ? '+' : '') + result.change} points</div>
                  <div><strong>New balance:</strong> {result.newPoints}</div>
                </>
              }
            </div>
          )}
        </div>

        <aside>
          <div className="card">
            <h4 style={{ marginTop:0 }}>How it works</h4>
            <p className="small">Planko randomly selects a multiplier bucket. The animation is for fun and reflects the server result.</p>
          </div>

          <div className="card" style={{ marginTop:12 }}>
            <h4 style={{ marginTop:0 }}>Leaderboard</h4>
            <LeaderboardShort />
          </div>
        </aside>
      </div>
    </div>
  );
}

function LeaderboardShort() {
  const [list,setList] = useState([]);
  useEffect(()=> {
    fetch('/api/leaderboard').then(r=>r.json()).then(j => setList(j.leaderboard || []));
  }, []);
  return (
    <div>
      {list.length === 0 ? <div className="small">No players yet</div> : list.slice(0,6).map((u,i)=> (
        <div key={u.discord_id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
          <div className="small">{i+1}. {u.username}</div>
          <div style={{ color:'#ffb3b3' }}>{u.points}</div>
        </div>
      ))}
    </div>
  );
}
