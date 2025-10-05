// web/pages/games/slot.js
import NavBar from '../../components/NavBar'
import { useEffect, useRef, useState } from 'react'

const SYMBOLS = ['🍒','🎃','⭐','👻','💀']
const SYMBOL_WEIGHTS = [40, 20, 15, 15, 10] // heavier cherries, rarer skull/star

function randomSymbol() {
  const total = SYMBOL_WEIGHTS.reduce((a,b)=>a+b,0)
  let r = Math.floor(Math.random() * total)
  for (let i=0;i<SYMBOL_WEIGHTS.length;i++){
    r -= SYMBOL_WEIGHTS[i]
    if (r < 0) return SYMBOLS[i]
  }
  return SYMBOLS[0]
}

export default function Slot() {
  const [user, setUser] = useState(null)
  const [bet, setBet] = useState(1)
  const [spinning, setSpinning] = useState(false)
  const [reels, setReels] = useState(['?','?','?'])
  const [result, setResult] = useState(null)

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null)}).catch(()=>setUser(null))
    return ()=> mounted=false
  },[])

  if (!user) {
    return (
      <>
        <NavBar />
        <main style={{minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card center" style={{flexDirection:'column', gap:12, padding:28}}>
            <h2 style={{color:'var(--accent)'}}>Sign in to play Slot Machine</h2>
            <p className="small">You must be logged in with Discord to play.</p>
            <a className="discord-btn" href="/api/auth/login">Sign in with Discord</a>
          </div>
        </main>
      </>
    )
  }

  async function spin() {
    setResult(null)
    const b = Number(bet) || 0
    if (b <= 0) return alert('Enter valid bet')
    if (b > user.points) return alert('Insufficient points')
    setSpinning(true)

    // simulate server-side slot result by calling API endpoint /api/slot
    try {
      const res = await fetch('/api/slot', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bet: b })})
      const j = await res.json()
      // create animation: cycle symbols quickly, then settle to result.reels
      const cycles = 18
      for (let t=0;t<cycles;t++){
        setReels([randomSymbol(), randomSymbol(), randomSymbol()])
        // speed up then slow down
        await new Promise(r=>setTimeout(r, 50 + t*12))
      }
      // settle to server result if present
      if (j && j.reels) {
        setReels(j.reels)
        setResult(j)
      } else {
        // fallback compute local
        const final = [randomSymbol(), randomSymbol(), randomSymbol()]
        setReels(final)
        setResult({ outcome:'Unknown', multiplier:0, change: -b, newPoints: user.points - b, reels: final })
      }
    } catch (err) {
      setResult({ error: 'Server error' })
    } finally {
      setSpinning(false)
      // refresh user points quickly
      fetch('/api/user').then(r=>r.json()).then(j=>{ if (j && j.discord_id) setUser(j) })
    }
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{alignItems:'start'}}>
        <div className="card">
          <h2>Slot Machine</h2>
          <p className="small" style={{marginTop:8}}>Spin three reels. Match symbols for multipliers. Set a bet and try your luck.</p>

          <div style={{display:'flex', gap:12, marginTop:12, alignItems:'center', flexWrap:'wrap'}}>
            <input className="input" type="number" min={1} value={bet} onChange={e=>setBet(e.target.value)} style={{width:140}} />
            <button className="btn" onClick={spin} disabled={spinning}>{spinning ? 'Spinning...' : 'Spin'}</button>
            <div style={{marginLeft:'auto'}} className="small">Your points: <strong style={{color:'var(--accent)'}}>{user.points}</strong></div>
          </div>

          <div className="slot-stage" style={{marginTop:18}}>
            <div className="reel"><div className="symbol">{reels[0]}</div></div>
            <div className="reel"><div className="symbol">{reels[1]}</div></div>
            <div className="reel"><div className="symbol">{reels[2]}</div></div>
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
          <h4>Slot Machine</h4>
          <p className="small">Symbols and multipliers are randomized. Check the Info page for tips.</p>
        </aside>
      </div>
    </>
  )
}
