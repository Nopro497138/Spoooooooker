// pages/auth/email.js
import NavBar from '../../components/NavBar';
import { useState } from 'react';
import Router from 'next/router';

export default function AuthEmail() {
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, username };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
      const j = await res.json();
      if (!res.ok) {
        setMsg({ type:'error', text: j.error || 'Failed' });
      } else {
        setMsg({ type:'ok', text: 'Success. Redirecting...' });
        setTimeout(()=> Router.push('/'), 800);
      }
    } catch (err) {
      setMsg({ type:'error', text: 'Server error' });
    } finally { setBusy(false); }
  }

  return (
    <>
      <NavBar />
      <main style={{minHeight:'calc(100vh - 72px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <div style={{width:420, background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border:'1px solid rgba(255,255,255,0.03)', padding:24, borderRadius:12, boxShadow:'0 12px 40px rgba(0,0,0,0.6)'}}>
          <h2 style={{marginTop:0, marginBottom:6}}>{mode === 'login' ? 'Sign in with Email' : 'Register an Account'}</h2>
          <p className="small">Use email to sign in. You can link Discord later via the Link flow.</p>

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column', gap:12, marginTop:12}}>
            {mode === 'register' && (
              <input className="input" placeholder="Display name (optional)" value={username} onChange={e=>setUsername(e.target.value)} />
            )}
            <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <div style={{display:'flex', gap:8}}>
              <button className="btn" disabled={busy}>{busy ? 'Working...' : (mode==='login' ? 'Sign in' : 'Register')}</button>
              <button type="button" className="ghost-btn" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login' ? 'Create account' : 'Have an account? Sign in'}</button>
            </div>

            {msg ? <div style={{color: msg.type==='error' ? '#ff7a7a' : '#9bffb0'}}>{msg.text}</div> : null}
          </form>
        </div>
      </main>
    </>
  );
}
