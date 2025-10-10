// pages/dev/index.js
import NavBar from '../../components/NavBar'
import { useEffect, useState } from 'react'

export default function Dev() {
  const [user, setUser] = useState(null)
  const [purchases, setPurchases] = useState([])

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null) })
    fetch('/api/dev/purchases').then(r=>r.json()).then(j=>setPurchases(j.purchases || []))
    return ()=> mounted=false
  },[])

  async function confirm(id) {
    await fetch('/api/dev/confirm_purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    const r = await fetch('/api/dev/purchases'); const j = await r.json(); setPurchases(j.purchases || [])
  }

  async function giveCandy() {
    const discord = prompt('Discord ID to give candy to?')
    const amount = Number(prompt('Amount?'))
    if (!discord || !amount) return
    await fetch('/api/dev/give_points', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ discord_id: discord, amount }) })
    alert('Given (if user exists).')
  }

  if (!user) {
    return <>
      <NavBar />
      <main className="container"><div className="card center" style={{padding:28}}>Sign in as owner to view Dev tools</div></main>
    </>
  }
  if (!user.is_owner) {
    return <>
      <NavBar />
      <main className="container"><div className="card center" style={{padding:28}}>You are not the owner.</div></main>
    </>
  }

  return (
    <>
      <NavBar />
      <main className="container" style={{paddingTop:20}}>
        <div className="card">
          <h2>Dev Dashboard</h2>
          <p className="small">Confirm purchases and manage users.</p>

          <div style={{marginTop:12}}>
            <button className="btn secondary" onClick={giveCandy}>Give Candy</button>
          </div>

          <div style={{marginTop:18}}>
            <h3>Pending purchases</h3>
            {purchases.length===0 ? <div className="small">No purchases</div> : purchases.map(p => (
              <div key={p.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                <div>
                  <div><strong>{p.productName}</strong> — {p.price} candy</div>
                  <div className="small">User: {p.discord_id} • {p.created_at}</div>
                </div>
                <div>
                  <button className="btn" onClick={()=>confirm(p.id)}>Confirm</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="card">
          <h4>Quick</h4>
          <div className="small">Owner tools.</div>
        </aside>
      </main>
    </>
  )
}
