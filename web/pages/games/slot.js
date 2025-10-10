// pages/games/slot.js
import NavBar from '../../components/NavBar'
import Modal from '../../components/Modal'
import { useEffect, useState } from 'react'

const EMOJIS = {
  'cherry': '🍒',
  'lemon': '🍋',
  'pumpkin': '🎃',
  'ghost': '👻',
  'skull': '💀',
  'star': '✨'
}

export default function Slot() {
  const [user, setUser] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [reels, setReels] = useState(['?', '?', '?'])
  const [modalOpen, setModalOpen] = useState(false)
  const [bet, setBet] = useState(1)

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null) }).catch(()=>setUser(null))
    return ()=> mounted=false
  },[])

  async function spin(amount){
    if (!user) { setModalOpen(true); setResult({ error: 'Sign in first' }); return }
    amount = Number(amount)
    if (!amount || amount <= 0) { setModalOpen(true); setResult({ error: 'Invalid bet' }); return }
    if (amount > (user.candy || 0)) { setModalOpen(true); setResult({ error: 'Insufficient candy' }); return }

    setSpinning(true)
    setResult(null)

    const symbols = Object.keys(EMOJIS)
    // quick visual spin
    let steps = 28
    for (let i=0;i<steps;i++){
      setReels([symbols[Math.floor(Math.random()*symbols.length)], symbols[Math.floor(Math.random()*symbols.length)], symbols[Math.floor(Math.random()*symbols.length)]])
      await new Promise(r=>setTimeout(r, 30 + i*4))
    }

    // call server
    try {
      const res = await fetch('/api/slot', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bet: amount }) })
      const j = await res.json()
      if (j.error) { setModalOpen(true); setResult({ error: j.error }); setSpinning(false); return }
      setReels(j.reels)
      setResult(j)
      setModalOpen(true)
      // refresh user
      const ures = await fetch('/api/user'); const uj = await ures.json(); setUser(uj && uj.discord_id ? uj : null)
    } catch (err) {
      console.error(err); setModalOpen(true); setResult({ error: 'Server error' })
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
              <div style={{fontSize:42,textAlign:'center', minWidth:70}}>{EMOJIS[reels[0]] || '❔'}</div>
              <div style={{fontSize:42,textAlign:'center', minWidth:70}}>{EMOJIS[reels[1]] || '❔'}</div>
              <div style={{fontSize:42,textAlign:'center', minWidth:70}}>{EMOJIS[reels[2]] || '❔'}</div>
            </div>
          </div>

          <div style={{display:'flex',gap:12,marginTop:12, alignItems:'center'}}>
            <input className="input" type="number" min="1" value={bet} onChange={e=>setBet(e.target.value)} style={{width:120}} />
            <button className="btn" onClick={()=>spin(bet)} disabled={spinning}>{spinning ? 'Spinning...' : `Spin ${bet}`}</button>
            <div style={{marginLeft:'auto'}} className="small">Your candy: <strong style={{color:'var(--accent)'}}>{user.candy}</strong></div>
          </div>

          <Modal open={modalOpen} title={result && result.error ? 'Result' : 'Payout'} onClose={()=>setModalOpen(false)}>
            {result ? (
              result.error ? <div style={{color:'#ff7a7a'}}>{result.error}</div> :
              <div>
                <div><strong>Reels:</strong> {result.reels.map(r=>EMOJIS[r]||r).join(' ')}</div>
                <div><strong>Multiplier:</strong> {result.multiplier}x</div>
                <div><strong>Won:</strong> {result.won}</div>
                <div><strong>New Balance:</strong> {result.newCandy}</div>
              </div>
            ) : null}
          </Modal>

        </div>

        <aside className="card">
          <h4>Shop</h4>
          <div className="small">Buy Packs and more in the Shop.</div>
        </aside>
      </div>
    </>
  )
}
