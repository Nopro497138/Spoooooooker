// pages/info.js
import NavBar from '../components/NavBar'

export default function Info() {
  return (
    <>
      <NavBar />
      <main className="container" style={{paddingTop:20}}>
        <div className="card" style={{padding:24}}>
          <h1>About SPOOOOOOKER</h1>
          <p className="small">SPOOOOOOKER is a spooky-themed arcade where you earn <strong>Halloween Candy</strong> by chatting and by playing games. Candy can be spent on packs, shop items, and bets inside games.</p>

          <section style={{marginTop:18}}>
            <h3>How it works</h3>
            <ol>
              <li>Sign in with Discord or create an email account on the website.</li>
              <li>Link your Discord account to your website account using the link flow (generate a token on the website, then run <code>/link TOKEN</code> in Discord).</li>
              <li>Send messages — every 50 messages you earn 1 Halloween Candy. Candy is synced between the bot and the website.</li>
              <li>Use Candy to buy Packs, open Shop items, or bet in games (Planko, Slot Machine).</li>
            </ol>
          </section>

          <section style={{marginTop:18}}>
            <h3>Packs & Shop</h3>
            <p className="small">Packs are grouped offers that may grant candy automatically or require owner confirmation for manual items (cosmetics, badges). Coupons can be used to get discounts during purchase. Owners can confirm pending purchases in the Dev dashboard.</p>
          </section>

          <section style={{marginTop:18}}>
            <h3>Privacy & Safety</h3>
            <p className="small">We only store minimal data required to operate the system: your Discord ID (if linked), optional email, display name, message count and candy balance. Do not share sensitive data. For persistence across restarts, deploy with a persistent database (Postgres/Supabase) — this site currently uses an in-memory DB for convenience.</p>
          </section>

        </div>
      </main>
    </>
  )
}
