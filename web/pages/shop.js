// web/pages/shop.js
import NavBar from '../components/NavBar'
import { useEffect, useState } from 'react'

export default function Shop() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])

  useEffect(()=> {
    let mounted = true
    fetch('/api/user').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j && j.discord_id ? j : null) }).catch(()=>setUser(null))
    fetch('/api/shop/products').then(r=>r.json()).then(j=>{ if(!mounted) return; setProducts(j.products || []) }).catch(()=>setProducts([]))
    return ()=> mounted=false
  },[])

  if (!user) {
    return (
      <>
        <NavBar />
        <main style={{minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card center" style={{flexDirection:'column', gap:12, padding:28}}>
            <h2 style={{color:'var(--accent)'}}>Sign in to access the Shop</h2>
            <p className="small">You must be logged in with Discord to buy items.</p>
            <a className="discord-btn" href="/api/auth/login">Sign in with Discord</a>
          </div>
        </main>
      </>
    )
  }

  async function buy(product) {
    if (!confirm(`Buy ${product.name} for ${product.price} points?`)) return
    const res = await fetch('/api/shop/purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ productId: product.id }) })
    const j = await res.json()
    if (j.error) alert('Error: ' + j.error)
    else alert('Purchase recorded. Developer will confirm it soon.')
    // refresh points
    fetch('/api/user').then(r=>r.json()).then(j=>setUser(j))
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{alignItems:'start'}}>
        <div className="card">
          <h2>Shop</h2>
          <p className="small" style={{marginTop:8}}>Spend your Halloween Points on cosmetics and upgrades. Purchases are recorded and can be confirmed by the site owner.</p>

          <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap:12, marginTop:12}}>
            {products.map(p => (
              <div key={p.id} className="card" style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                <div>
                  <h3 style={{marginBottom:8}}>{p.name}</h3>
                  <p className="small">{p.description}</p>
                </div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12}}>
                  <div style={{fontWeight:800, color:'var(--accent)'}}>{p.price} pts</div>
                  <button className="btn" onClick={()=>buy(p)}>Buy</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="card">
          <h4>Your balance</h4>
          <div style={{marginTop:8}} className="small">You have <strong style={{color:'var(--accent)'}}>{user ? user.points : 0}</strong> points.</div>
          <p className="small" style={{marginTop:12}}>Purchases will be visible to the owner for confirmation.</p>
        </aside>
      </div>
    </>
  )
}
