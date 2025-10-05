// web/pages/info.js
import NavBar from '../components/NavBar'

export default function Info() {
  return (
    <>
      <NavBar />
      <div className="container" style={{paddingTop:20}}>
        <div className="card">
          <h2>How to use Spoooooooker</h2>
          <p className="lead" style={{marginTop:10}}>Quick guide to link your Discord and play games.</p>

          <section style={{marginTop:16}}>
            <h3>1) Sign in</h3>
            <p className="small">Click the Sign in button in the top-right. This uses Discord OAuth to link your account (we only store minimal info to show your username and points).</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>2) Earn Halloween Points</h3>
            <p className="small">Earn points by interacting on Discord (e.g. events, custom logic). Points are used for playing games and buying items in the shop.</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>3) Play Games</h3>
            <p className="small">Open <strong>Games</strong>. You can play <em>Planko</em> (ball drop, multipliers) or <em>Slot Machine</em>. Set a bet, press play and enjoy animations and results. Wins update your points immediately.</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>Privacy</h3>
            <p className="small">We only use your Discord ID and username to identify you. No sensitive data is collected. For production use a hosted database is recommended.</p>
          </section>
        </div>

        <aside className="card" style={{height:'fit-content'}}>
          <h3>Tips</h3>
          <ul className="small">
            <li>Use the site on iPad for the best experience.</li>
            <li>Leaderboard shows top players and updates after each game.</li>
            <li>Have fun and be spooky 👻</li>
          </ul>
        </aside>
      </div>
    </>
  )
}
