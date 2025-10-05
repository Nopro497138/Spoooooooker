// web/pages/games/index.js
import NavBar from '../../components/NavBar'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Games() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/user').then(r => r.json()).then(j => {
      if (!mounted) return
      setUser(j && j.discord_id ? j : null)
    }).catch(()=>setUser(null))
    return ()=> mounted = false
  },[])

  // If not logged in show nothing but login CTA
  if (!user) {
    return (
      <>
        <NavBar />
        <main style={{minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card center" style={{flexDirection:'column', gap:12, padding:28}}>
            <h2 style={{color:'var(--accent)'}}>Sign in to access Games</h2>
            <p className="small">You must be logged in with Discord to play.</p>
            <a className="discord-btn" href="/api/auth/login">Sign in with Discord</a>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{alignItems:'start'}}>
        <div className="card">
          <h2>Games</h2>
          <p className="small" style={{marginTop:8}}>Choose a game below. Your points are shown in the top-right.</p>

          <div style={{display:'grid', gap:12, marginTop:14}}>
            <Link href="/games/planko"><a className="card" style={{display:'block', textDecoration:'none', color:'inherit'}}>
              <h3>Planko</h3>
              <p className="small">Drop the ball and land on a multiplier. Classic and spooky!</p>
            </a></Link>

            <Link href="/games/slot"><a className="card" style={{display:'block', textDecoration:'none', color:'inherit'}}>
              <h3>Slot Machine</h3>
              <p className="small">Spin 3 reels. Match symbols to win multipliers and prizes.</p>
            </a></Link>
          </div>
        </div>

        <aside className="card">
          <h4>Leaderboard</h4>
          <p className="small">Top players are visible on the home page and updated after each game.</p>
        </aside>
      </div>
    </>
  )
}
