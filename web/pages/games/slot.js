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
  const [betModalOpen, setBetModalOpen] = useState(false)
  const [betAmount, setBetAmount] = useState(1)

  useEffect(()=> {
    let mounted = true
    fetch('/api/user', { cache: 'no-store' }).then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.id ? j : null) }).catch(()=>setUser(null))
    return ()=> mounted=false
  },[])

  async function startSpin() {
    setBetModalOpen(true)
  }

  async function confirmSpin(amount) {
    setBetModalOpen(false)
    setSpinning(true)
    setResult(null)

    const symbols = Object.keys(EMOJIS)
    let steps = 25
    for (let i=0;i<steps;i++){
      setReels([symbols[Math.floor(Math.random()*symbols.length)], symbols[Math.floor(Math.random()*symbols.length)], symbols[Math.floor(Math.random()*symbols.length)]])
      await new Promise(r=>setTimeout(r, 22 + i))
    }

    try {
      const res = await fetch('/api/slot', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bet: amount }) })
      const j = await res.json()
      if (j.error) { setResult({ error: j.error }); setModalOpen(true); setSpinning(false); return }
      setReels(j.reels)
      setResult(j)
      setModalOpen(true)
      const ures = await fetch('/api/user', { cache: 'no-store' }); const uj = await ures.json(); setUser(uj && uj.id ? uj : null)
    } catch (err) {
      console.error(err); setResult({ error: 'Server error' }); setModalOpen(true)
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
            <p className="small">Sign in with Discord or email to play and spend candy.</p>
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
            <button className="btn" onClick={startSpin} disabled={spinning}>{spinning ? 'Spinning...' : 'Spin'}</button>
            <div style={{marginLeft:'auto'}} className="small">Your candy: <strong style={{color:'var(--accent)'}}>{user.candy}</strong></div>
          </div>

          <Modal open={betModalOpen} title="Place your bet" onClose={()=>setBetModalOpen(false)}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <input className="input" type="number" min="1" value={betAmount} onChange={e=>setBetAmount(Number(e.target.value))} />
              <button className="btn" onClick={()=>confirmSpin(betAmount)} disabled={spinning}>Confirm Bet</button>
            </div>
          </Modal>

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
