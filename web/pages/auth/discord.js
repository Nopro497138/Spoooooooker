// pages/auth/discord.js
import { useEffect } from 'react';
import Router from 'next/router';

export default function AuthDiscord() {
  useEffect(() => {
    // client-side redirect to API OAuth launcher
    window.location.href = '/api/auth/discord';
  }, []);
  return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#0b0b10',padding:24,borderRadius:12,boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}}>Redirecting to Discord...</div>
    </div>
  );
}
