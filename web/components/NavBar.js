// components/NavBar.js
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NavBar() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/user').then(r => r.json()).then(j => {
      if (!mounted) return
      if (j && j.discord_id) setUser(j)
      else setUser(null)
    }).catch(()=>setUser(null))
    return ()=>{ mounted = false }
  }, [])

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-left" style={{display:'flex', alignItems:'center', gap:12}}>
        <Link href="/"><a style={{textDecoration:'none'}}>
          <div style={{display:'flex', flexDirection:'column'}}>
            <div className="brand" style={{fontSize:18, color:'var(--accent)', fontWeight:800}}>spoooooooker</div>
            <div className="sub" style={{fontSize:12}}>galaxy • halloween</div>
          </div>
        </a></Link>

        <div className="nav-links" style={{marginLeft:12}}>
          <Link href="/"><a>Home</a></Link>
          <Link href="/games"><a>Games</a></Link>
          <Link href="/shop"><a>Shop</a></Link>
          <Link href="/packs"><a>Packs</a></Link>
          <Link href="/info"><a>Info</a></Link>
        </div>
      </div>

      <div className="nav-right" style={{display:'flex',alignItems:'center',gap:12}}>
        {user ? (
          <>
            <div className="points-badge" title="Your Halloween Candy" aria-live="polite" style={{display:'flex',alignItems:'center',gap:8}}>
              <img src="/images/halloween_candy.png" alt="candy" className="candy-icon" />
              <div style={{fontWeight:800}}>{user.candy}</div>
            </div>

            <div style={{textAlign:'right', minWidth:160}}>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>Logged in as</div>
              <div style={{fontWeight:800}}>{user.username ? `${user.username}${user.discriminator ? '#' + user.discriminator : ''}` : 'User ' + user.discord_id}</div>
            </div>
          </>
        ) : (
          <a className="discord-btn" href="/api/auth/login" title="Sign in with Discord" aria-label="Sign in with Discord">
            <svg width="18" height="18" viewBox="0 0 71 55" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{display:'inline-block', verticalAlign:'middle'}}>
              <path d="M60.8 4.6C54.7 1.8 48.2.6 41.7.6c-1 .6-2 1.4-2.9 2.2-5.3 0-10.7.1-16 0-.9-.9-1.8-1.6-2.8-2.1A19.736 19.736 0 0 0 3.684 4.37C1.63 9.19.653 13.951 1.109 18.668c2.035 1.489 4.011 2.426 5.935 3.05 1.286.405 2.506.68 3.654.85 1.142.169 2.156.255 3.02.255.863 0 1.878-.086 3.02-.255 1.148-.17 2.368-.445 3.654-.85 1.924-.624 3.9-1.561 5.935-3.05.459-4.717-.52-9.478-2.574-14.299z" fill="#fff"/>
            </svg>
            <span style={{marginLeft:8, fontWeight:800}}>Sign in</span>
          </a>
        )}
      </div>
    </nav>
  )
}
