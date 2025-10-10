// pages/packs.js
import NavBar from '../components/NavBar'
import { useEffect, useState } from 'react'

export default function Packs() {
  const [user, setUser] = useState(null)
  const packs = [
    { id: 'bronze_pack', name: 'Bronze Pack', price: 50, perks: ['+5 candy', 'small message booster'] },
    { id: 'silver_pack', name: 'Silver Pack', price: 100, perks: ['+15 candy', 'medium booster', 'profile badge'] },
    { id: 'gold_pack', name: 'Gold Pack', price: 200, perks: ['+40 candy', 'large booster', 'special badge'] }
  ]

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null) }).catch(()=>setUser(null))
    return ()=> mounted=false
  },[])

  async function buy(pack) {
    if (!user) { alert('Sign in first'); return }
    if (!confirm(`Buy ${pack.name} for ${pack.price} Halloween Candy?`)) return
    const res = await fetch('/api/shop/purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ productId: pack.id }) })
    const j = await res.json()
    if (j.error) alert('Error: ' + j.error)
    else {
      alert('Purchase submitted. Owner will confirm and grant perks.')
      fetch('/api/user').then(r=>r.json()).then(j=>setUser(j))
    }
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{paddingTop:20}}>
        <div className="card">
          <h2>Packs</h2>
          <p className="small">Open packs to get boosters, candy and cosmetics.</p>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12, marginTop:16}}>
            {packs.map(p => (
              <div key={p.id} className="card" style={{display:'flex',flexDirection:'column',justifyContent:'space-between',padding:16, minHeight:160}}>
                <div>
                  <h3 style={{marginTop:0}}>{p.name}</h3>
                  <ul className="small">
                    {p.perks.map((x,i)=> <li key={i}>{x}</li>)}
                  </ul>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between', marginTop:12}}>
                  <div style={{fontWeight:800, color:'var(--accent)'}}>{p.price} candy</div>
                  <button className="btn" onClick={()=>buy(p)}>Buy</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="card">
          <h4>Your balance</h4>
          <div style={{marginTop:8}} className="small">You have <strong style={{color:'var(--accent)'}}>{user ? user.candy : 0}</strong> Halloween Candy.</div>
          <p className="small" style={{marginTop:12}}>Packs are subject to owner confirmation for perk distribution.</p>
        </aside>
      </div>
    </>
  )
}
