// components/NavBar.js
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Head from 'next/head'

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
    <>
      {/* load fonts once per page via Head here (Poppins & Inter) */}
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Poppins:wght@600;800&display=swap" rel="stylesheet" />
      </Head>

      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-left" style={{display:'flex', alignItems:'center', gap:16}}>
          <Link href="/"><a style={{textDecoration:'none', display:'flex', alignItems:'center', gap:12}}>
            <div style={{display:'flex', flexDirection:'column', lineHeight:1}}>
              <div style={{
                fontFamily: 'Poppins, Inter, system-ui, sans-serif',
                fontSize: 20,
                fontWeight: 800,
                background: 'linear-gradient(90deg,#ff8b8b,#9b59ff)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textTransform: 'uppercase',
                letterSpacing: 2,
                filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.4))'
              }}>
                SPOOOOOOKER
              </div>
            </div>
          </a></Link>

          <div className="nav-links" style={{marginLeft:6}}>
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
              {/* inline Discord glyph (keeps crisp) */}
              <svg width="18" height="18" viewBox="0 0 71 55" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{display:'inline-block', verticalAlign:'middle'}}>
                <path d="M60.8 4.6C54.7 1.8 48.2.6 41.7.6c-1 .6-2 1.4-2.9 2.2-5.3 0-10.7.1-16 0-.9-.9-1.8-1.6-2.8-2.1A19.736 19.736 0 0 0 3.684 4.37C1.63 9.19.653 13.951 1.109 18.668 3.144 20.157 5.12 21.094 7.044 21.718 8.33 22.123 9.55 22.398 10.698 22.568 11.84 22.737 12.855 22.823 13.719 22.823 14.582 22.823 15.597 22.737 16.739 22.568 17.887 22.398 19.107 22.123 20.393 21.718 30.033 17.93 38.918 16.23 47.206 18.596 49.731 11.879 50.915 6.111 50.474 0.392 49.7 0.028 44.9-0.29 40.4 0.65 36.08 1.54 31.88 3.52 27.92 3.52 26.02 3.52 24.14 3.32 22.34 3.08 20.56 1.68 18.96 0.02 17.2 0.02 16.04 0.02 14.92 0.53 14.06 1.4 13.2 2.27 12.6 3.4 12.36 4.663 11.98 6.118 12.24 7.536 12.66 9.12 13.64 10.58 15.28 11.14 17.12 11.06 22.75 10.68 28.36 9.87 33.75 7.55 34.85 7.06 36.07 6.67 37.26 6.46 38.56 6.29 39.84 6.27 41.04 6.36 42.23 6.44 43.33 6.71 44.32 7.14 45.37 7.8 46.42 8.46 47.36 9.29 48.04 10.33 48.71 11.38 49.08 12.6 49.33 13.86 49.34 15.2 49.05 16.44 48.77 17.68 48.27 18.82 47.53 19.79 46.79 20.76 45.86 21.59 44.77 22.19 43.68 22.8 42.44 23.18 41.18 23.46 39.82 23.58 38.46 23.7 37 23.66 35.56 23.59 34.24 23.27 33 22.88 31.75 22.49 30.57 21.86 29.48 21.23 28.5 20.38 27.6 19.35 26.73 18.31 26 17.08 25.3 15.8 24.73 14.48 24.49 13.05 24.25 11.62 24.46 10.14 24.84 8.72 25.23 7.3 25.8 5.94 26.55 4.67 27.3 3.39 28.24 2.23 29.29 1.21 30.53 0.38 31.77 -0.44 33.12 -0.82 34.48 -0.94 35.94 -0.76 37.34 -0.42 38.76 0.06 40.07 0.76 41.32 1.58 42.48 2.68 43.55 3.98 44.45 5.48 45.28 7.07 45.9 8.81 46.29 10.64 46.33 12.55 46.28 14.46 45.9 16.33 45.3 18.1 44.59 19.86 43.64 21.46 42.64 22.98 41.41 24.29 40.07 25.47 38.52 26.43 36.85 27.25 34.99 27.8 33 28.18 31 28.37 29 28.32 26.98 28.17 24.98 27.83 23.06 27.28 21.28 26.52 19.59 25.66 18.07 24.61 16.65 23.35 15.43 22.01 14.28 20.59 13.37 19.18 12.56 17.76 11.9 16.2 11.42 14.7 11.19 13.08 11.07 11.47 11.18 9.84 11.49 8.25 12.05 6.8 12.87 5.51 13.68 4.27 14.7 3.2 15.88 2.47 17.24 2.01 18.62 1.76 20.02 1.73 21.41 1.78 22.7 2.05 23.91 2.48 25 3.07 26.05 3.83 27.03 4.7 27.92 5.7 28.71 6.8 29.35 8.05 29.84 9.37 30.17 10.8 30.33 12.31 30.22 13.79 29.96 15.22 29.5 16.58 28.86 17.82 28.05 18.9 27.12 19.9 26.03 20.77 24.92 21.56 23.53 22.17 22.1 22.64 20.56 22.95 19.01 23.15 17.35 23.18 15.7 23.05 14.06 22.76 12.41 22.32 10.81 21.72 9.34 21 7.98 20.11 6.71 19.07 5.6 17.9 4.61 16.6 3.78 15.22 3.18 13.8 2.76 12.36 2.52 10.98 2.38 9.66 2.43 8.42 2.65 7.34 3.06 6.35 3.65 5.45 4.4 4.7 5.3 4.08 6.33 3.62 7.43 3.28 8.6 3.05 9.84 2.96 11.12 2.97 12.37 3.08 13.58 3.27 14.71 3.6 15.77 4.09 16.8 4.7 17.74 5.49 18.6 6.41" fill="#fff"/>
              </svg>
              <span style={{marginLeft:8, fontWeight:800}}>Sign in</span>
            </a>
          )}
        </div>
      </nav>
    </>
  )
}
