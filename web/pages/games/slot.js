// pages/games/slot.js
import NavBar from '../../components/NavBar'
import { useEffect, useState } from 'react'

export default function Slot() {
  const [user, setUser] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [reels, setReels] = useState(['?', '?', '?'])

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null) }).catch(()=>setUser(null))
    return ()=> mounted=false
  },[])

  async function spin(bet) {
    if (!user) { alert('Sign in'); return }
    if (bet <=0) return
    setSpinning(true)
    setResult(null)
    // visual fake spin
    const symbols = ['cherry','lemon','pumpkin','ghost','skull','star']
    let steps = 30
    for (let i=0;i<steps;i++){
      setReels([symbols[Math.floor(Math.random()*symbols.length)], symbols[Math.floor(Math.random()*symbols.length)], symbols[Math.floor(Math.random()*symbols.length)]])
      await new Promise(r=>setTimeout(r, 40 + i*3))
    }

    // call server
    try {
      const res = await fetch('/api/slot', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bet }) })
      const j = await res.json()
      if (j.error) { alert(j.error); setSpinning(false); return }
      setReels(j.reels)
      setResult(j)
      // refresh user balance
      const ures = await fetch('/api/user'); const uj = await ures.json(); setUser(uj && uj.discord_id ? uj : null)
    } catch (err) {
      console.error(err); alert('Error')
    } finally {
      setSpinning(false)
    }
  }

  if (!user) {
    return (
      <>
        <NavBar />
        <main className="container">
          <div className="card center" style={{padding:28}}>
            <h2>Sign in to play Slot Machine</h2>
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
          <h2>Slot Machine</h2>
          <p className="small">Spin 3 reels. Match symbols to win multipliers.</p>

          <div style={{display:'flex',justifyContent:'center',marginTop:16,gap:12}}>
            <div className="card" style={{padding:18,minWidth:320,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:28,fontWeight:900, minWidth:70, textAlign:'center'}}>{reels[0]}</div>
              <div style={{fontSize:28,fontWeight:900, minWidth:70, textAlign:'center'}}>{reels[1]}</div>
              <div style={{fontSize:28,fontWeight:900, minWidth:70, textAlign:'center'}}>{reels[2]}</div>
            </div>
          </div>

          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button className="btn" onClick={()=>spin(1)} disabled={spinning}>Spin 1</button>
            <button className="btn" onClick={()=>spin(5)} disabled={spinning}>Spin 5</button>
            <div style={{marginLeft:'auto'}} className="small">Your candy: <strong style={{color:'var(--accent)'}}>{user.candy}</strong></div>
          </div>

          {result && (
            <div className="card" style={{marginTop:12}}>
              <div><strong>Payout:</strong> {result.multiplier}x — Won: {result.won}</div>
              <div><strong>New balance:</strong> {result.newCandy}</div>
            </div>
          )}

        </div>

        <aside className="card">
          <h4>Shop</h4>
          <div className="small">Buy Packs and more in the Shop.</div>
        </aside>
      </div>
    </>
  )
}
