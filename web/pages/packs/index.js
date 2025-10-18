// pages/packs/index.js
import NavBar from '../../components/NavBar';
import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';

export default function PacksPage() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [opening, setOpening] = useState(false);
  const [openResult, setOpenResult] = useState(null);

  async function load() {
    const p = await fetch('/api/products').then(r => r.json()).catch(()=>({products:[]}));
    setProducts((p.products||[]).filter(x=>x.id && x.id.includes('_pack')));
    const u = await fetch('/api/user', { cache:'no-store' }).then(r=>r.json()).catch(()=>({}));
    setUser(u && (u.id || u.discord_id) ? u : null);
  }

  useEffect(()=>{ load(); const t = setInterval(load, 7000); return ()=>clearInterval(t); },[]);

  async function openPack(pack) {
    if (!user) {
      setOpenResult({ error: 'Please sign in to open packs.' });
      return;
    }
    if ((user.candy || 0) < pack.price) {
      setOpenResult({ error: 'Insufficient candy' });
      return;
    }
    setOpening(true);
    try {
      const res = await fetch('/api/shop/purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ productId: pack.id }) });
      const j = await res.json();
      if (!res.ok) {
        setOpenResult({ error: j.error || 'Purchase failed' });
      } else {
        const gained = pack.auto_candy || 0;
        setOpenResult({ ok: true, gained, status: j.purchase.status });
        const u = await fetch('/api/user', { cache:'no-store' }).then(r=>r.json());
        setUser(u && (u.id || u.discord_id) ? u : null);
      }
    } catch (err) {
      console.error(err);
      setOpenResult({ error: 'Server error' });
    } finally {
      setOpening(false);
      setTimeout(()=> setOpenResult(null), 7000);
    }
  }

  return (
    <>
      <NavBar />
      <main className="container page-enter" style={{paddingTop:20}}>
        <div className="card" style={{padding:20}}>
          <h2>Packs</h2>
          <p className="small">Open thematic packs for candy and boosters.</p>

          <div style={{display:'flex', gap:12, marginTop:12, flexWrap:'wrap'}}>
            {products.map(p => (
              <div key={p.id} style={{width:260, padding:16, borderRadius:12, background:'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.008))', border:'1px solid rgba(255,255,255,0.03)'}}>
                <div style={{height:120, borderRadius:10, background:'linear-gradient(90deg, rgba(255,100,120,0.05), rgba(150,90,240,0.04))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34}}>
                  🎁
                </div>
                <div style={{marginTop:10}}>
                  <div style={{fontWeight:800}}>{p.name}</div>
                  <div className="small">{p.description}</div>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10}}>
                  <div style={{fontWeight:800}}>{p.price} Candy</div>
                  <button className="btn" onClick={()=>openPack(p)} disabled={opening}>{opening ? 'Opening...' : 'Open'}</button>
                </div>
              </div>
            ))}
          </div>

          <Modal open={!!openResult} title={openResult && openResult.error ? 'Pack Error' : 'Pack Opened'} onClose={()=>setOpenResult(null)}>
            {openResult ? (
              openResult.error ? <div style={{color:'#ff7a7a'}}>{openResult.error}</div> :
              <div>
                <div style={{fontWeight:800}}>You received:</div>
                <div style={{marginTop:8}}>{openResult.gained} Candy</div>
                <div className="small" style={{marginTop:8}}>Status: {openResult.status}</div>
              </div>
            ) : null}
          </Modal>
        </div>
      </main>
    </>
  );
}
