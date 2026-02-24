import { useState, useEffect } from 'react';
import { db } from '../db/database';

const API = 'http://localhost:8080/api';

export default function SyncBadge() {
  const [reachable, setReachable] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const update = async () => {
      const count = await db.sync_queue.count();
      setPending(count);

      // Check backend directly, not just navigator.onLine
      try {
        const res = await fetch(`${API}/tasks`, {
          signal: AbortSignal.timeout(1500)
        });
        setReachable(res.ok);
      } catch {
        setReachable(false);
      }
    };

    update();
    const interval = setInterval(update, 3000); // check every 3s
    window.addEventListener('sync-complete', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sync-complete', update);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16,
      display: 'flex', alignItems: 'center', gap: 8,
      background: reachable ? '#1a1a2e' : '#2d1b1b',
      border: `1px solid ${reachable ? '#00ff88' : '#ff4444'}`,
      borderRadius: 20, padding: '6px 14px',
      fontSize: 13, fontWeight: 600, color: '#fff',
      zIndex: 1000, transition: 'all 0.3s ease'
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: reachable ? '#00ff88' : '#ff4444',
        boxShadow: reachable ? '0 0 8px #00ff88' : '0 0 8px #ff4444'
      }} />
      {reachable ? 'Live' : 'Offline'}
      {pending > 0 && (
        <span style={{
          background: '#ff9900', color: '#000',
          borderRadius: 10, padding: '2px 8px', fontSize: 11
        }}>
          {pending} pending
        </span>
      )}
      {pending === 0 && reachable && (
        <span style={{ color: '#00ff88', fontSize: 11 }}>✓ synced</span>
      )}
    </div>
  );
}