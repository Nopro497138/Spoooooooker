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
            <p className="small">Click Sign in (top-right). This links your Discord account to show your username and points.</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>2) Earn Halloween Points</h3>
            <p className="small">Start with 50 Halloween Points. Earn more via Discord events and gameplay.</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>3) Play Games</h3>
            <p className="small">Open <strong>Games</strong>. Play <em>Planko</em> (ball drop) or <em>Slot Machine</em>. Place a bet, enjoy animations and see immediate results.</p>
          </section>

          <section style={{marginTop:12}}>
            <h3>Privacy</h3>
            <p className="small">We use your Discord ID and username to identify you. No sensitive personal data is collected via this site.</p>
          </section>
        </div>

        <aside className="card" style={{height:'fit-content'}}>
          <h3>Tips</h3>
          <ul className="small">
            <li>Use iPad for best experience.</li>
            <li>Leaderboard updates after each game.</li>
            <li>Have fun and be spooky 👻</li>
          </ul>
        </aside>
      </div>
    </>
  )
}
