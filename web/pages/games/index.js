// pages/games/index.js
import NavBar from '../../components/NavBar'
import Link from 'next/link'

export default function GamesIndex() {
  return (
    <>
      <NavBar />
      <main className="container" style={{paddingTop:20}}>
        <div className="card" style={{padding:24}}>
          <h2>Games</h2>
          <p className="small">Choose a game — your Halloween Candy balance is shown in the top-right. Sign in to play.</p>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16, marginTop:12}}>
            <div className="card" style={{padding:18}}>
              <h3>Planko</h3>
              <p className="small">Drop a ball into multipliers. Skill + luck.</p>
              <Link href="/games/planko"><a className="link-inline">Play Planko →</a></Link>
            </div>

            <div className="card" style={{padding:18}}>
              <h3>Slot Machine</h3>
              <p className="small">Spin 3 reels. Match emojis to win candy.</p>
              <Link href="/games/slot"><a className="link-inline">Play Slot →</a></Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
