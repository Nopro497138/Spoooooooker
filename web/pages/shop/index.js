// pages/shop/index.js
import NavBar from '../../components/NavBar';
import Modal from '../../components/Modal';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [buying, setBuying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState(null);

  async function load() {
    const p = await fetch('/api/products').then(r => r.json()).catch(()=>({products:[],coupons:[]}));
    setProducts(p.products || []);
    setCoupons(p.coupons || []);
    const u = await fetch('/api/user', { cache: 'no-store' }).then(r => r.json()).catch(()=>({}));
    setUser(u && (u.id || u.discord_id) ? u : null);
  }

  useEffect(()=> { load(); const t = setInterval(load, 6000); return ()=>clearInterval(t); }, []);

  function openBuy(prod) {
    if (!user) {
      // users must sign in first to access purchase UI
      setMessage({ type:'error', text: 'Please sign in to buy items.' });
      setTimeout(()=> setMessage(null), 5000);
      return;
    }
    setSelected(prod); setModalOpen(true); setMessage(null); setCouponCode('');
  }

  async function confirmBuy() {
    if (!selected) return;
    setBuying(true);
    try {
      const res = await fetch('/api/shop/purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ productId: selected.id, couponCode: couponCode || null }) });
      const j = await res.json();
      if (!res.ok) {
        setMessage({ type:'error', text: j.error || 'Purchase failed' });
      } else {
        setMessage({ type: 'success', text: `Purchase ${j.purchase.status}. Your candy: ${j.user.candy}` });
        // refresh user/products
        const u = await fetch('/api/user', { cache:'no-store' }).then(r=>r.json());
        setUser(u && (u.id || u.discord_id) ? u : null);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type:'error', text: 'Server error' });
    } finally {
      setBuying(false);
      setTimeout(()=> setMessage(null), 6000);
    }
  }

  return (
    <>
      <NavBar />
      <main className="container page-enter" style={{paddingTop:20}}>
        <div className="card" style={{padding:20}}>
          <h2>Shop</h2>
          <p className="small">Buy Packs and items with Halloween Candy. Some items require owner confirmation.</p>

          {message ? <div style={{marginTop:12, color: message.type==='error' ? '#ff7a7a' : '#9bffb0'}}>{message.text}</div> : null}

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12, marginTop:12}}>
            {products.map(p => (
              <div key={p.id} style={{padding:14, borderRadius:10, background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.03)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:800}}>{p.name}</div>
                    <div className="small" style={{marginTop:6}}>{p.description}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:800}}>{p.price}</div>
                    <div className="small">Candy</div>
                  </div>
                </div>
                <div style={{marginTop:10, display:'flex', gap:8}}>
                  <button className="btn" onClick={()=>openBuy(p)}>Buy</button>
                  <Link href={`/packs/${p.id}`}><a className="ghost-btn">View</a></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Modal open={modalOpen} title={selected ? `Buy ${selected.name}` : 'Buy'} onClose={()=>{ setModalOpen(false); setSelected(null); setMessage(null); }}>
        {selected ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div><strong>{selected.name}</strong><div className="small">{selected.description}</div></div>
              <div style={{textAlign:'right'}}><div style={{fontWeight:800}}>{selected.price} Candy</div></div>
            </div>

            <div>
              <label className="small">Coupon (optional)</label>
              <input className="input" value={couponCode} onChange={(e)=>setCouponCode(e.target.value)} placeholder="Enter coupon code" />
            </div>

            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={confirmBuy} disabled={buying}>{buying ? 'Buying...' : 'Confirm Purchase'}</button>
              <button className="ghost-btn" onClick={()=>{ setModalOpen(false); setSelected(null); }}>Cancel</button>
            </div>

          </div>
        ) : null}
      </Modal>
    </>
  );
}
