// web/pages/info.js
import NavBar from '../components/NavBar'

export default function Info() {
  return (
    <>
      <NavBar />
      <div className="container" style={{paddingTop:20}}>
        <div className="card">
          <h2>How to use Spoooooooker</h2>
          <p className="lead" style={{marginTop:10}}>Quick guide to link your Discord, earn points and play games.</p>

          <section style={{marginTop:16}}>
            <h3>1) Sign in</h3>
            <p className="small">Click the Sign in button in the top-right. This uses Discord OAuth to link your account (we only store your Discord ID, username and points).</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>2) Earn Halloween Points</h3>
            <p className="small">Every 50 messages in servers where the bot is online you get 1 Halloween Point. Points are stored server-side.</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>3) Play Games</h3>
            <p className="small">Open <strong>Games</strong>. You can play <em>Planko</em> (ball drop, multipliers) or <em>Slot Machine</em>. Set a bet, press play and enjoy animations and results. Wins update your points immediately.</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>Notes & Privacy</h3>
            <p className="small">This demo stores minimal info to track points. For production use we recommend a hosted DB (Postgres/Supabase) rather than ephemeral storage. No dev-only pages are exposed to normal users.</p>
          </section>
        </div>

        <aside className="card" style={{height:'fit-content'}}>
          <h3>Tips</h3>
          <ul className="small">
            <li>Use the site on iPad for best experience.</li>
            <li>Leaderboard shows top players.</li>
            <li>Be spooky, have fun 😈</li>
          </ul>
        </aside>
      </div>
    </>
  )
}
