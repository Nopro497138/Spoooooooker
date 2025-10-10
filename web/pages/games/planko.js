// pages/games/planko.js
import NavBar from '../../components/NavBar'
import { useEffect, useRef, useState } from 'react'

export default function Planko() {
  const [user, setUser] = useState(null)
  const betRef = useRef()
  const canvasRef = useRef()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null) }).catch(()=>setUser(null))
    return ()=> mounted=false
  },[])

  async function play(e){
    e.preventDefault()
    if (!user) { alert('Sign in first'); return }
    const bet = Number(betRef.current.value || 0)
    if (!bet || bet <= 0) return alert('Enter a bet')
    setRunning(true)
    setResult(null)

    // animate simple falling ball across canvas
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    ctx.clearRect(0,0,c.width,c.height)
    // draw pegs
    const cols = 15
    const rows = 11
    const pegRadius = 4
    const paddingX = 20
    const paddingY = 20
    for (let r=0;r<rows;r++){
      for (let col=0;col<cols;col++){
        const x = paddingX + col*( (c.width-2*paddingX)/(cols-1) ) + (r%2?(((c.width-2*paddingX)/(cols-1))/2):0)
        const y = paddingY + r*28
        ctx.beginPath(); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.arc(x,y,pegRadius,0,Math.PI*2); ctx.fill()
      }
    }

    // call server
    try {
      const res = await fetch('/api/planko', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bet }) })
      const j = await res.json()
      if (j.error) { alert(j.error); setRunning(false); return }

      // simple animation: circle drops and waves to final column
      const finalCol = j.column
      const colsCount = 15
      const steps = 40
      for (let i=0;i<=steps;i++){
        const t = i/steps
        ctx.clearRect(0,0,c.width,c.height)
        // redraw pegs
        for (let r=0;r<rows;r++){
          for (let col=0;col<cols;col++){
            const x = paddingX + col*( (c.width-2*paddingX)/(cols-1) ) + (r%2?(((c.width-2*paddingX)/(cols-1))/2):0)
            const y = paddingY + r*28
            ctx.beginPath(); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.arc(x,y,pegRadius,0,Math.PI*2); ctx.fill()
          }
        }
        // ball position interp
        const startX = c.width/2
        const endX = paddingX + finalCol*( (c.width-2*paddingX)/(cols-1) )
        const x = startX + (endX - startX) * (t + 0.05*Math.sin(t*8))
        const y = paddingY + (rows+2)*28 * t
        ctx.beginPath(); ctx.fillStyle = '#ff8b8b'; ctx.arc(x,y,10,0,Math.PI*2); ctx.fill()
        await new Promise(r => setTimeout(r, 14))
      }

      setResult(j)
      // refresh user balance after play
      const ures = await fetch('/api/user'); const uj = await ures.json(); setUser(uj && uj.discord_id ? uj : null)
    } catch (err) {
      console.error(err); alert('Error during play')
    } finally {
      setRunning(false)
    }
  }

  if (!user) {
    return (
      <>
        <NavBar />
        <main className="container">
          <div className="card center" style={{padding:28}}>
            <h2 style={{color:'var(--accent)'}}>Sign in to play Planko</h2>
            <p className="small">Click Sign in (top-right) to link your Discord.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{paddingTop:20}}>
        <div className="card">
          <h2>Planko</h2>
          <p className="small">Drop the ball and hope it lands in a good multiplier. Less extreme multipliers for fairer gameplay.</p>

          <canvas ref={canvasRef} width={820} height={360} style={{width:'100%',borderRadius:10,display:'block',marginTop:12,background:'linear-gradient(180deg, rgba(0,0,0,0.15), transparent)'}} />

          <form onSubmit={play} style={{display:'flex',gap:12,alignItems:'center',marginTop:12}}>
            <input ref={betRef} defaultValue={1} type="number" min="1" max={user.candy || 99999} className="input" />
            <button className="btn" disabled={running}>{running ? 'Playing...' : 'Play Planko'}</button>
            <div style={{marginLeft:'auto'}} className="small">Your candy: <strong style={{color:'var(--accent)'}}>{user.candy}</strong></div>
          </form>

          {result && (
            <div className="card" style={{marginTop:12}}>
              <div><strong>Outcome:</strong> {result.outcome}</div>
              <div><strong>Multiplier:</strong> {result.multiplier}x</div>
              <div><strong>Change:</strong> {result.change >=0 ? '+'+result.change : result.change}</div>
              <div><strong>New balance:</strong> {result.newCandy}</div>
            </div>
          )}

        </div>

        <aside className="card">
          <h4>Leaderboard</h4>
          <div className="small">Top players are updated on the home page after games.</div>
        </aside>
      </div>
    </>
  )
}
