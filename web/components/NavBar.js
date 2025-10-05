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
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/"><a className="logo" aria-label="Spoooooooker Home">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{filter:'drop-shadow(0 6px 18px rgba(0,0,0,0.5)'}}>
            <rect x="1" y="1" width="22" height="22" rx="6" fill="#2b0b3b"/>
            <path d="M6 8c1.2-2 6-2 9 0 0 0-1.5 3-4.5 3S6 8 6 8z" fill="#ffb3b3" opacity="0.9"/>
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
          <Link href="/info"><a>Info</a></Link>
        </div>
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <div className="points-badge" title="Your Halloween Points">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.64 8.36L20 10.27L14.5 14.64L15.82 21L12 17.77L8.18 21L9.5 14.64L4 10.27L10.36 8.36L12 2Z" fill="#fff"/></svg>
              <div>{user.points}</div>
            </div>
            <div style={{textAlign:'right', minWidth:160}}>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>Logged in as</div>
              <div style={{fontWeight:800}}>{user.username ? `${user.username}${user.discriminator ? '#' + user.discriminator : ''}` : 'User ' + user.discord_id}</div>
            </div>
          </>
        ) : (
          <a className="discord-btn" href="/api/auth/login" title="Sign in with Discord">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M20.317 4.369A19.791 19.791 0 0 0 15.536 3c-.2.356-.432.82-.593 1.184-1.776-.266-3.549-.266-5.277 0-.16-.365-.392-.828-.593-1.185A19.736 19.736 0 0 0 3.684 4.37C1.63 9.19.653 13.951 1.109 18.668c2.035 1.489 4.011 2.426 5.935 3.05 1.286.405 2.506.68 3.654.85 1.142.169 2.156.255 3.02.255.863 0 1.878-.086 3.02-.255 1.148-.17 2.368-.445 3.654-.85 1.924-.624 3.9-1.561 5.935-3.05.459-4.717-.52-9.478-2.574-14.299z" fill="#fff"/>
            </svg>
            Sign in
          </a>
        )}
      </div>
    </nav>
  )
}
