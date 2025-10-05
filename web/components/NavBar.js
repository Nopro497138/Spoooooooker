// web/components/NavBar.js
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
      <div className="nav-left">
        <Link href="/"><a className="logo" aria-label="Spoooooooker Home">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{filter:'drop-shadow(0 6px 18px rgba(0,0,0,0.5)'}}>
            <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#190627" stroke="rgba(255,255,255,0.02)"/>
            <path d="M6 8c1.2-2 6-2 9 0 0 0-1.5 3-4.5 3S6 8 6 8z" fill="#ff8b8b" opacity="0.95"/>
            <circle cx="12" cy="12" r="3.5" fill="#9b59ff" />
          </svg>
          <div>
            <div className="brand">spoooooooker</div>
            <div className="sub">galaxy • halloween</div>
          </div>
        </a></Link>

        <div className="nav-links" style={{marginLeft:12}}>
          <Link href="/"><a>Home</a></Link>
          <Link href="/games"><a>Games</a></Link>
          <Link href="/shop"><a>Shop</a></Link>
          <Link href="/info"><a>Info</a></Link>
        </div>
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <div className="points-badge" title="Your Halloween Points" aria-live="polite">
              <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.6 8.36L20 10.27L14.5 14.64L15.82 21L12 17.77L8.18 21L9.5 14.64L4 10.27L10.36 8.36L12 2Z" fill="white"/></svg>
              <div>{user.points}</div>
            </div>
            <div style={{textAlign:'right', minWidth:160}}>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>Logged in as</div>
              <div style={{fontWeight:800}}>{user.username ? `${user.username}${user.discriminator ? '#' + user.discriminator : ''}` : 'User ' + user.discord_id}</div>
            </div>
          </>
        ) : (
          <a className="discord-btn" href="/api/auth/login" title="Sign in with Discord" aria-label="Sign in with Discord">
            {/* official Discord glyph simplified, purple gradient background */}
            <svg className="icon" viewBox="0 0 71 55" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M60.8 4.6C54.7 1.8 48.2.6 41.7.6c-1 .6-2 1.4-2.9 2.2-5.3 0-10.7.1-16 0-.9-.9-1.8-1.6-2.8-2.1C22.7.5 14.8 1.3 8.5 4.6c-6.2 3.2-9.4 8.4-9.6 14.4-.4 6.9.9 13.6 3.3 20.1 7 3.8 14 6.1 20.9 7.7 1.4-1.8 2.8-3.6 4.2-5.4-3.9-1.1-7.7-2.6-11-5.1 0 0 2.1 1.2 12.8 6.2 10.2 4.9 19.5 6.1 28.2 2.5 2.5-6.8 3.8-13.6 3.4-20.5-.2-6.1-3.4-11.3-9.6-14.5z" fill="#fff" opacity="0.95"/>
            </svg>
            Sign in
          </a>
        )}
      </div>
    </nav>
  )
}
