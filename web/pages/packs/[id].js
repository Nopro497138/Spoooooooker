// pages/packs/[id].js
import NavBar from '../../components/NavBar';
import Modal from '../../components/Modal';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PackDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [pack, setPack] = useState(null);
  const [user, setUser] = useState(null);
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(()=> {
    if (!id) return;
    fetch('/api/products').then(r=>r.json()).then(j=> {
      const p = (j.products||[]).find(x=>x.id === id);
      setPack(p || null);
    }).catch(()=>setPack(null));
    fetch('/api/user', { cache:'no-store' }).then(r=>r.json()).then(j=> setUser(j && j.id ? j : null)).catch(()=>setUser(null));
  }, [id]);

  async function openPack() {
    if (!user) { setResult({ error: 'Sign in first' }); return; }
    if (!pack) return;
    if ((user.candy || 0) < pack.price) { setResult({ error: 'Insufficient candy' }); return; }
    setOpening(true);
    try {
      const res = await fetch('/api/shop/purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ productId: pack.id }) });
      const j = await res.json();
      if (!res.ok) setResult({ error: j.error || 'Purchase failed' });
      else {
        setResult({ ok:true, status: j.purchase.status, gained: pack.auto_candy || 0 });
        const u = await fetch('/api/user', { cache:'no-store' }).then(r=>r.json()); setUser(u && u.id ? u : null);
      }
    } catch (err) {
      console.error(err); setResult({ error: 'Server error' });
    } finally { setOpening(false); }
  }

  return (
    <>
      <NavBar />
      <main style={{padding:24}}>
        <div style={{maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 320px', gap:20}}>
          <div style={{background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border:'1px solid rgba(255,255,255,0.03)', padding:20, borderRadius:12}}>
            <h2 style={{marginTop:0}}>{pack ? pack.name : 'Pack'}</h2>
            <p className="small">{pack ? pack.description : 'Loading...'}</p>

            <div style={{marginTop:14, display:'flex', gap:12, alignItems:'center'}}>
              <div style={{fontWeight:800, fontSize:20}}>{pack ? `${pack.price} Candy` : ''}</div>
              <button className="btn" onClick={openPack} disabled={opening || !user || !pack}>{opening ? 'Opening...' : 'Open Pack'}</button>
              {!user && <div className="small" style={{marginLeft:8,color:'#ffcc99'}}>Sign in to open packs</div>}
            </div>

            <div style={{marginTop:18}}>
              <h4>Contents</h4>
              <div className="small">This pack may contain candy and boosters. Some rewards are applied automatically; others require owner confirmation.</div>
            </div>
          </div>

          <aside style={{background:'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.008))', border:'1px solid rgba(255,255,255,0.03)', borderRadius:12, padding:16}}>
            <h4>Pack Preview</h4>
            <div style={{height:160, borderRadius:8, background:'linear-gradient(90deg, rgba(255,120,120,0.04), rgba(140,90,240,0.04))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40}}>
              🎁
            </div>

            <div style={{marginTop:12}}>
              <div className="small">Starter candy on first account creation: 50</div>
              <div className="small" style={{marginTop:8}}>Owner may be required to confirm some items.</div>
            </div>
          </aside>
        </div>
      </main>

      <Modal open={!!result} title={result && result.error ? 'Notice' : 'Pack Result'} onClose={()=>setResult(null)}>
        {result ? (
          result.error ? <div style={{color:'#ff7a7a'}}>{result.error}</div> :
          <div>
            <div style={{fontWeight:800}}>Opened!</div>
            <div className="small" style={{marginTop:8}}>Gained: {result.gained} Candy</div>
            <div className="small" style={{marginTop:6}}>Status: {result.status}</div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
