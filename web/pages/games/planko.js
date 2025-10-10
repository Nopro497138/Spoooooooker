// pages/games/planko.js
import NavBar from '../../components/NavBar'
import Modal from '../../components/Modal'
import { useEffect, useRef, useState } from 'react'

export default function Planko() {
  const [user, setUser] = useState(null)
  const betRef = useRef()
  const canvasRef = useRef()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null) }).catch(()=>setUser(null))
    return ()=> mounted=false
  },[])

  useEffect(()=> {
    // draw initial pegs / multipliers on resize
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    function drawStatic(){
      ctx.clearRect(0,0,c.width,c.height)
      // draw background gradient
      const g = ctx.createLinearGradient(0,0,0,c.height)
      g.addColorStop(0,'rgba(255,255,255,0.02)')
      g.addColorStop(1,'rgba(0,0,0,0.1)')
      ctx.fillStyle = g
      ctx.fillRect(0,0,c.width,c.height)
      // draw pegs lightly
      const cols = 15, rows = 11
      for (let r=0;r<rows;r++){
        for (let col=0;col<cols;col++){
          const x = 40 + col*((c.width-80)/(cols-1)) + (r%2?((c.width-80)/(cols-1))/2:0)
          const y = 30 + r*28
          ctx.beginPath(); ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.arc(x,y,4,0,Math.PI*2); ctx.fill()
        }
      }
      // bottom multipliers row
      const multipliers = [0,0.5,1,1.1,1.2,1.4,2,3,5,2,1.4,1.2,1.1,1,0.5]
      const boxW = (c.width-120)/multipliers.length
      for (let i=0;i<multipliers.length;i++){
        const x = 60 + i*boxW
        const y = c.height - 48
        const mult = multipliers[i]
        ctx.fillStyle = mult>=2 ? '#ff7a7a' : mult>1 ? '#ffa85f' : '#6b6b6b'
        roundRect(ctx, x, y, boxW-6, 36, 8, true, false)
        ctx.fillStyle = '#061018'
        ctx.font = 'bold 14px Inter'
        ctx.textAlign = 'center'
        ctx.fillText((mult===0? '0x' : mult+'x'), x + (boxW-6)/2, y + 22)
      }
    }
    function roundRect(ctx,x,y,w,h,r,fill,stroke){
      if (typeof r === 'undefined') r=5
      ctx.beginPath()
      ctx.moveTo(x+r,y)
      ctx.arcTo(x+w,y,x+w,y+h,r)
      ctx.arcTo(x+w,y+h,x,y+h,r)
      ctx.arcTo(x,y+h,x,y,r)
      ctx.arcTo(x,y,x+w,y,r)
      ctx.closePath()
      if (fill) ctx.fill()
      if (stroke) ctx.stroke()
    }
    drawStatic()
  },[])

  async function play(e){
    e.preventDefault()
    if (!user) { setModalOpen(true); setResult({ error: 'Sign in first' }); return }
    const bet = Number(betRef.current.value || 0)
    if (!bet || bet <= 0) { setModalOpen(true); setResult({ error: 'Enter a valid bet' }); return }
    if (bet > (user.candy || 0)) { setModalOpen(true); setResult({ error: 'Insufficient candy' }); return }

    setRunning(true)
    setResult(null)

    // server call
    try {
      const res = await fetch('/api/planko', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bet }) })
      const j = await res.json()
      if (j.error) { setModalOpen(true); setResult({ error:j.error }); setRunning(false); return }

      // animate ball with simple gravity
      const c = canvasRef.current; const ctx = c.getContext('2d')
      const cols = 15, rows = 11
      const startX = c.width/2
      const endX = 60 + j.column*((c.width-120)/(cols-1))
      let x = startX, y = 20, vx = (endX - startX)/60, vy = 0, g=0.8
      for (let t=0;t<80;t++){
        ctx.globalCompositeOperation = 'source-over'
        // redraw static lightly
        ctx.clearRect(0,0,c.width,c.height)
        // draw static again
        // we won't rewrite full static for performance; just draw pegs faintly
        for (let r=0;r<rows;r++){
          for (let col=0;col<cols;col++){
            const px = 40 + col*((c.width-80)/(cols-1)) + (r%2?((c.width-80)/(cols-1))/2:0)
            const py = 30 + r*28
            ctx.beginPath(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.arc(px,py,4,0,Math.PI*2); ctx.fill()
          }
        }
        // ball physics update
        vy += g; x += vx; y += vy;
        // slight horizontal jitter
        vx += (Math.random()-0.5)*0.2
        ctx.beginPath(); ctx.fillStyle = '#ff8b8b'; ctx.arc(x,y,10,0,Math.PI*2); ctx.fill()
        await new Promise(r=>setTimeout(r, 12))
      }

      setResult(j)
      setModalOpen(true)
      // refresh user balance
      const ures = await fetch('/api/user'); const uj = await ures.json(); setUser(uj && uj.discord_id ? uj : null)
    } catch (err) {
      console.error(err); setModalOpen(true); setResult({ error: 'Server error' })
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
          <p className="small">Drop the ball and hope it lands on a multiplier. Fairer multipliers and visible payouts below.</p>

          <canvas ref={canvasRef} width={900} height={380} style={{width:'100%',borderRadius:10,display:'block',marginTop:12,background:'linear-gradient(180deg, rgba(0,0,0,0.15), transparent)'}} />

          <form onSubmit={play} style={{display:'flex',gap:12,alignItems:'center',marginTop:12}}>
            <input ref={betRef} defaultValue={1} type="number" min="1" max={user.candy || 99999} className="input" />
            <button className="btn" disabled={running}>{running ? 'Playing...' : 'Play Planko'}</button>
            <div style={{marginLeft:'auto'}} className="small">Your candy: <strong style={{color:'var(--accent)'}}>{user.candy}</strong></div>
          </form>

          <Modal open={modalOpen} title={result && result.error ? 'Error' : 'Result'} onClose={()=>setModalOpen(false)}>
            {result ? (
              result.error ? (
                <div style={{color:'#ff7a7a'}}>{result.error}</div>
              ) : (
                <div>
                  <div><strong>Outcome:</strong> {result.outcome}</div>
                  <div><strong>Multiplier:</strong> {result.multiplier}x</div>
                  <div><strong>Change:</strong> {result.change >=0 ? '+'+result.change : result.change}</div>
                  <div><strong>New balance:</strong> {result.newCandy}</div>
                </div>
              )
            ) : null}
          </Modal>

        </div>

        <aside className="card">
          <h4>Leaderboard</h4>
          <div className="small">Top players are updated regularly.</div>
        </aside>
      </div>
    </>
  )
}
