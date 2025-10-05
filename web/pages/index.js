// web/pages/index.js
import NavBar from '../components/NavBar'

export default function Home() {
  return (
    <>
      <NavBar />
      <main style={{minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <div className="card" style={{maxWidth:1000, width:'100%'}}>
          <section style={{display:'flex', gap:20, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap'}}>
            <div style={{flex:'1 1 420px'}}>
              <h1 style={{color:'var(--accent)', fontSize:32}}>Welcome to <span style={{letterSpacing:2}}>spoooooooker</span></h1>
              <p className="lead">A spooky galaxy arcade — sign in with Discord to link your account and play games like Planko and Slot Machine. Earn Halloween Points on Discord (1 point every 50 messages).</p>
              <div style={{marginTop:16}}>
                <a className="btn secondary" href="/games" style={{marginRight:12}}>Open Games</a>
                <a className="btn" href="/info">Learn how to use</a>
              </div>
            </div>

            <div style={{width:300, minWidth:260}}>
              <div style={{padding:18, borderRadius:12, background:'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)'}}>
                <h3 style={{marginBottom:8}}>Your spooky hub</h3>
                <p className="small">Sign in with Discord (top-right) to see your points and access games. The site is optimized for desktop, iPad and mobile.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
