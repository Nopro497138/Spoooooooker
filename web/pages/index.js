// pages/index.js
import NavBar from '../components/NavBar';
import { useEffect, useState } from 'react';

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      const j = await res.json();
      setLeaderboard(j.leaderboard || []);
    } catch (e) {
      setLeaderboard([]);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
    const t = setInterval(fetchLeaderboard, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <NavBar />
      <main className="container" style={{ paddingTop: 20 }}>
        <div className="card">
          <h2>Welcome to SPOOOOOOKER</h2>
          <p className="small">Play games and earn Halloween Candy.</p>

          <div style={{ marginTop: 12 }}>
            <h3>Games</h3>
            <ul>
              <li><a href="/games/planko">Planko</a></li>
              <li><a href="/games/slot">Slot Machine</a></li>
            </ul>
          </div>
        </div>

        <aside className="card">
          <h4>Leaderboard</h4>
          {leaderboard.length === 0 ? <div className="small">No players yet.</div> : (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {leaderboard.map((p) => (
                <li key={p.discord_id} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{p.username || ('User ' + p.discord_id)}</div>
                  <div className="small">Candy: {p.candy} • Messages: {p.messages}</div>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </main>
    </>
  );
}
