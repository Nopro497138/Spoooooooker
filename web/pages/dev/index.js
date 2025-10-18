// pages/dev/index.js
import NavBar from '../../components/NavBar';
import { useEffect, useState } from 'react';

export default function DevPage() {
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [giving, setGiving] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState(10);

  async function loadUser() {
    const u = await fetch('/api/user', { cache:'no-store' }).then(r=>r.json()).catch(()=>({}));
    setUser(u && u.id ? u : null);
  }

  async function loadPending() {
    const p = await fetch('/api/dev/purchases', { cache:'no-store' }).then(r=>r.json()).catch(()=>({purchases:[]}))
    setPending(p.purchases || []);
  }

  async function loadUsers() {
    const list = await fetch('/api/dev/users', { cache:'no-store' }).then(r=>r.json()).catch(()=>({users:[]}));
    setUsers(list.users || []);
  }

  useEffect(()=> { loadUser(); const t=setInterval(loadUser,3000); return ()=>clearInterval(t); },[]);
  useEffect(()=> { loadPending(); loadUsers(); const t=setInterval(()=>{loadPending(); loadUsers()},8000); return ()=>clearInterval(t); },[]);

  async function confirmPurchase(id) {
    try {
      await fetch('/api/dev/confirm_purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
      await loadPending(); await loadUsers();
    } catch(err){ console.error(err) }
  }

  async function givePoints() {
    if (!targetId || !amount) return;
    setGiving(true);
    try {
      await fetch('/api/dev/give_points', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ discord_id: targetId, amount }) });
      setTargetId(''); setAmount(10);
      await loadUsers();
    } catch(e){ console.error(e) }
    setGiving(false);
  }

  if (!user || !user.is_owner) {
    return (
      <>
        <NavBar />
        <main className="container" style={{paddingTop:20}}>
          <div className="card" style={{padding:20}}>
            <h2>Dev Dashboard</h2>
            <p className="small">You must be the owner to access this page.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="container" style={{paddingTop:20}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:16}}>
          <div className="card" style={{padding:16}}>
            <h3>Pending Purchases</h3>
            {pending.length===0 ? <div className="small">No pending purchases.</div> : (
              <ul>
                {pending.map(p=>(
                  <li key={p.id} style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:800}}>{p.productName}</div>
                        <div className="small">User: {p.discord_id} • Price: {p.price}</div>
                      </div>
                      <div>
                        <button className="btn" onClick={()=>confirmPurchase(p.id)}>Confirm</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="card" style={{padding:16}}>
            <h3>Give Candy</h3>
            <div className="small">Give candy to a user by Discord ID (owner only).</div>
            <input className="input" placeholder="Discord ID" value={targetId} onChange={e=>setTargetId(e.target.value)} />
            <input className="input" type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
            <button className="btn" onClick={givePoints} disabled={giving}>{giving ? 'Sending...' : 'Give'}</button>

            <div style={{height:14}} />
            <h4>Users</h4>
            <div style={{maxHeight:260, overflowY:'auto'}}>
              {users.length===0 ? <div className="small">No users yet</div> : users.map(u=>(
                <div key={u.id} style={{marginBottom:8}}>
                  <div style={{fontWeight:800}}>{u.username || (u.email || u.discord_id || u.id)}</div>
                  <div className="small">Candy: {u.candy} • Messages: {u.messages}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
