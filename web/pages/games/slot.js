// web/pages/games/slot.js
import NavBar from '../../components/NavBar';
import { useEffect, useState, useRef } from 'react';

const REEL_SYMBOLS = ['🍒','🔔','⭐','💀','🎃'];

export default function Slot() {
  const [user, setUser] = useState(null);
  const [bet, setBet] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const reelRefs = [useRef(), useRef(), useRef()];

  useEffect(()=> {
    fetch('/api/user').then(r=>r.json()).then(d => { if (d && d.discord_id) setUser(d); });
  }, []);

  async function spin() {
    if (!user) return window.location.href = '/api/auth/login';
    if (bet <= 0 || isNaN(bet)) return alert('Enter a valid bet');
    setSpinning(true);
    setResult(null);

    try {
      // start reel animations (CSS)
      reelRefs.forEach((r, idx) => {
        if (!r.current) return;
        r.current.style.transition = 'transform 1.2s cubic-bezier(.17,.67,.28,1)';
        r.current.style.transform = `translateY(-${Math.random()*300 + 500}px)`;
      });

      const resp = await fetch('/api/slot', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ bet }) });
      const data = await resp.json();
      if (data.error) {
        setResult({ error: data.error });
        setSpinning(false);
        return;
      }

      // after animation delay, show results
      setTimeout(()=> {
        // set final symbols visually
        reelRefs.forEach((r, idx) => {
          if (!r.current) return;
          r.current.style.transition = 'none';
          r.current.innerText = data.reels[idx];
          r.current.style.transform = 'translateY(0)';
        });

        setResult(data);
        setUser(prev => prev ? ({ ...prev, points: data.newPoints }) : prev);
        setSpinning(false);
      }, 1400);
    } catch (err) {
      setResult({ error: 'Unexpected error' });
      setSpinning(false);
    }
  }

  if (!user) {
    return (
      <div className="container">
        <NavBar />
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <h3 style={{ color:'#ffb4ff' }}>Sign in to play Slot Machine</h3>
          <a href="/api/auth/login" className="
