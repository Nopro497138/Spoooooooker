// web/pages/games/planko.js
import NavBar from '../../components/NavBar'
import { useEffect, useState, useRef } from 'react'

export default function Planko() {
  const [user, setUser] = useState(null)
  const [bet, setBet] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const ballRef = useRef(null)
  const boardRef = useRef(null)

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null) }).catch(()=>setUser(null))
    return ()=> mounted=false
  },[])

  if (!user) {
    return (
      <>
        <NavBar />
        <main style={{minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card center" style={{flexDirection:'column', gap:12, padding:28}}>
            <h2 style={{color:'var(--accent)'}}>Sign in to play Planko</h2>
            <p className="small">You must be logged in with Discord to play.</p>
            <a className="discord-btn" href="/api/auth/login">Sign in with Discord</a>
          </div>
        </main>
      </>
    )
  }

  async function play() {
    setResult(null)
    const b = Number(bet) || 0
    if (b <= 0) return alert('Enter valid bet')
    setLoading(true)

    // create small drop animation
    if (ballRef.current) {
      ballRef.current.style.transition = 'none'
      ballRef.current.style.transform = 'translateY(-220px)'
      // trigger reflow
      void ballRef.current.offsetWidth
      ballRef.current.style.transition = 'transform 1.2s cubic-bezier(.2,.8,.2,1)'
      ballRef.current.style.transform = 'translateY(140px)'
    }

    try {
      const r = await fetch('/api/planko', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({bet:b})})
      const j = await r.json()
      setTimeout(()=> {
        setResult(j)
        setLoading(false)
      }, 1200) // wait for animation
    } catch (err) {
      setResult({ error: 'Server error' })
      setLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{alignItems:'start'}}>
        <div className="card">
          <h2>Planko</h2>
          <p className="small" style={{marginTop:8}}>Drop the ball and try your luck — multipliers are applied to your bet.</p>

          <div style={{display:'flex', gap:12, marginTop:12, flexWrap:'wrap', alignItems:'center'}}>
            <input className="input" type="number" min={1} value={bet} onChange={e=>setBet(e.target.value)} style={{width:140}} />
            <button className="btn" onClick={play} disabled={loading}> {loading ? 'Dropping...' : 'Play'} </button>
            <div style={{marginLeft:'auto'}} className="small">Your points: <strong style={{color:'var(--accent)'}}>{user.points}</strong></div>
          </div>

          <div ref={boardRef} className="planko-board" style={{marginTop:18}}>
            {/* simple decorative pegs */}
            <div style={{position:'absolute', left:0, right:0, top:0, bottom:0, pointerEvents:'none'}}>
              <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none" style={{opacity:0.06}}>
                <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stopColor="#9b59ff"/><stop offset="1" stopColor="#ff6b6b"/></linearGradient></defs>
                <g fill="none" stroke="url(#g)" strokeWidth="1">
                  <circle cx="120" cy="80" r="6"/><circle cx="200" cy="120" r="6"/><circle cx="300" cy="60" r="6"/>
                  <circle cx="420" cy="140" r="6"/><circle cx="520" cy="100" r="6"/><circle cx="640" cy="80" r="6"/>
                </g>
              </svg>
            </div>

            <div style={{position:'absolute', left:'calc(50% - 12px)', top:20, width:24, height:24, borderRadius:999, background:'linear-gradient(180deg,#fff,#ffd1d1)', boxShadow:'0 8px 18px rgba(0,0,0,0.5)'}} ref={ballRef}></div>
            <div style={{position:'absolute', left:0, right:0, bottom:14, display:'flex', justifyContent:'space-around', padding:'0 40px'}}>
              <div style={{width:120, textAlign:'center'}}>x0</div>
              <div style={{width:120, textAlign:'center'}}>x1.5</div>
              <div style={{width:120, textAlign:'center'}}>x2</div>
              <div style={{width:120, textAlign:'center'}}>x5</div>
            </div>
          </div>

          {result && (
            <div style={{marginTop:12, padding:12, borderRadius:10, background:'rgba(0,0,0,0.35)'}}>
              {result.error ? <div style={{color:'#ff9b9b'}}><strong>Error:</strong> {result.error}</div> : (
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

        <aside className="card">
          <h4>About Planko</h4>
          <p className="small">This is a randomized game — bets are subtracted immediately and wins added. Play responsibly.</p>
        </aside>
      </div>
    </>
  )
}
