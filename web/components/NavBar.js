// components/NavBar.js
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function NavBar(){
  const [user, setUser] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])

  async function fetchUser(){
    try {
      const res = await fetch('/api/user');
      const j = await res.json();
      setUser(j && j.discord_id ? j : null);
    } catch (e) { setUser(null) }
  }

  async function fetchLeaderboard(){
    try {
      const res = await fetch('/api/leaderboard');
      const j = await res.json();
      setLeaderboard(j.leaderboard || []);
    } catch (e) { setLeaderboard([]) }
  }

  useEffect(()=> {
    fetchUser();
    fetchLeaderboard();
    const t1 = setInterval(fetchUser, 4000); // live update candy frequently
    const t2 = setInterval(fetchLeaderboard, 8000);
    return ()=> { clearInterval(t1); clearInterval(t2) }
  }, [])

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Poppins:wght@600;800&display=swap" rel="stylesheet" />
      </Head>

      <nav className="navbar" role="navigation">
        <div className="nav-left">
          <Link href="/"><a className="logo" style={{textDecoration:'none'}}>
            <div className="brand">SPOOOOOOKER</div>
          </a></Link>

          <div className="nav-links">
            <Link href="/"><a>Home</a></Link>
            <Link href="/games"><a>Games</a></Link>
            <Link href="/shop"><a>Shop</a></Link>
            <Link href="/packs"><a>Packs</a></Link>
            <Link href="/info"><a>Info</a></Link>
            {user && user.is_owner ? <Link href="/dev"><a style={{color:'var(--accent)'}}>Dev</a></Link> : null}
          </div>
        </div>

        <div className="nav-right" style={{alignItems:'center'}}>
          {user ? (
            <>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className="points-badge" title="Your Halloween Candy" aria-live="polite">
                  <img src="/images/halloween_candy.png" alt="candy" className="candy-icon" />
                  <div style={{fontWeight:800}}>{user.candy}</div>
                </div>
                <div style={{textAlign:'right', minWidth:150}}>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>Logged in as</div>
                  <div style={{fontWeight:800}}>{user.username ? `${user.username}${user.discriminator ? '#'+user.discriminator : ''}` : 'User '+user.discord_id}</div>
                </div>
              </div>
            </>
          ) : (
            <a className="discord-btn" href="/api/auth/login" title="Sign in with Discord">
              <span style={{marginLeft:8, fontWeight:800}}>Sign in</span>
            </a>
          )}
        </div>
      </nav>
    </>
  )
}
