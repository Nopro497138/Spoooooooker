// web/components/NavBar.js
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NavBar() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/user').then(r => r.json()).then(j => {
      if (!mounted) return
      setUser(j)
    }).catch(() => setUser(null))
    return () => { mounted = false }
  }, [])

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/" passHref>
          <a className="logo">
            <div className="brand">
              spoooooooker
            </div>
            <div className="sub">galaxy • halloween</div>
          </a>
        </Link>
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <div className="points-badge">
              <span role="img" aria-label="Halloween Candy">🎃</span> {user.candy} Halloween Candy
            </div>
            <div style={{ textAlign: 'right', minWidth: '160px' }}>
              <div>{user.username ? `${user.username}#${user.discriminator}` : 'User ' + user.discord_id}</div>
            </div>
          </>
        ) : (
          <a href="/api/auth/login" className="discord-btn">
            <span role="img" aria-label="Discord">💬</span> Sign in with Discord
          </a>
        )}
      </div>
    </nav>
  )
}
