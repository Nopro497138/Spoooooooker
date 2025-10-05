// web/pages/dev.js
import NavBar from '../components/NavBar'
import { useEffect, useState } from 'react'

export default function Dev() {
  const [user, setUser] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [purchases, setPurchases] = useState([])
  const [targetId, setTargetId] = useState('')
  const [pointsAmount, setPointsAmount] = useState(10)

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if (!mounted) return; setUser(j); if (j && j.discord_id) {
      // ask server if owner (owner id env is checked server-side in api)
      fetch('/api/dev/is_owner').then(r=>r.json()).then(x=>{ if(!mounted) return; setIsOwner(x.isOwner) })
    }})
    fetch('/api/dev/purchases').then(r=>r.json()).then(j=>setPurchases(j.purchases || []))
    return ()=> mounted=false
  },[])

  if (!user) {
    return (
      <>
        <NavBar />
        <main className="center" style={{minHeight:'calc(100vh - 64px)'}}>
          <div className="card center" style={{flexDirection:'column', gap:12}}>
            <h3>Sign in as owner to access dev tools</h3>
            <a className="discord-btn" href="/api/auth/login">Sign in</a>
          </div>
        </main>
      </>
    )
  }

  if (!isOwner) {
    return (
      <>
        <NavBar />
        <main style={{minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card center" style={{flexDirection:'column', gap:12}}>
            <h3>Access denied</h3>
            <p className="small">You are not listed as the OWNER for this site.</p>
          </div>
        </main>
      </>
    )
  }

  async function refreshPurchases() {
    const r = await fetch('/api/dev/purchases')
    const j = await r.json()
    setPurchases(j.purchases || [])
  }

  async function confirm(id) {
    if (!confirm('Confirm this purchase and mark as delivered?')) return
    await fetch('/api/dev/confirm_purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    refreshPurchases()
  }

  async function givePoints() {
    if (!targetId) return alert('Enter target discord id.')
    const r = await fetch('/api/dev/give_points', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ discordId: targetId, amount: Number(pointsAmount) }) })
    const j = await r.json()
    if (j.error) alert('Error: ' + j.error)
    else {
      alert('Points granted.')
    }
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{alignItems:'start'}}>
        <div className="card">
          <h2>Dev Console</h2>
          <p className="small">Owner tools: grant points & manage purchases.</p>

          <section style={{marginTop:12}}>
            <h4>Grant Points</h4>
            <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
              <input className="input" placeholder="Discord ID" value={targetId} onChange={e=>setTargetId(e.target.value)} />
              <input className="input" type="number" value={pointsAmount} onChange={e=>setPointsAmount(e.target.value)} style={{width:120}} />
              <button className="btn" onClick={givePoints}>Grant</button>
            </div>
          </section>

          <section style={{marginTop:20}}>
            <h4>Pending Purchases</h4>
            <div style={{marginTop:8, display:'grid', gap:10}}>
              {purchases.length === 0 ? <div className="small">No purchases yet.</div> : purchases.map(p => (
                <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, borderRadius:8, background:'rgba(0,0,0,0.25)'}}>
                  <div>
                    <div style={{fontWeight:800}}>{p.productName} <span style={{color:'var(--muted)',fontWeight:600}}>({p.price} pts)</span></div>
                    <div className="small">User: {p.discord_id} • #{p.id} • {new Date(p.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn" onClick={()=>confirm(p.id)}>Confirm</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="card">
          <h4>Owner Info</h4>
          <p className="small">Actions here affect real users — be careful.</p>
        </aside>
      </div>
    </>
  )
}
