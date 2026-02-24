import { useState, useEffect } from 'react';
import { db, queueAction, generateBadge } from '../db/database';
import { flushSyncQueue } from '../sync/syncEngine';
import TaskCard from './TaskCard';

export default function SwipeStack() {
  const [tasks, setTasks] = useState([]);
  const [gone, setGone] = useState([]);
  const [toast, setToast] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    db.tasks.toArray().then(setTasks);
    db.badges.toArray().then(setBadges);
  }, []);

  const showToast = (msg, color = '#00ff88') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2000);
  };

  const handleSwipe = async (direction, task) => {
    setGone(prev => [...prev, task.id]);

    if (direction === 'right') {
      // Write locally first — optimistic
      const application = {
        id: `app_${Date.now()}`,
        task_id: task.id,
        user_id: 'user_001',
        created_at: Date.now(),
        synced: false,
        status: 'pending'
      };
      await db.applications.put(application);

      // Queue for background sync
      await queueAction('APPLY', {
        task_id: task.id,
        user_id: 'user_001',
        client_ts: Date.now()
      });

      // Generate skill badges for each required skill
      const newBadges = [];
      for (const skill of task.skills_required || []) {
        const badge = await generateBadge(skill, task.id);
        newBadges.push(badge);
      }
      setBadges(prev => [...prev, ...newBadges]);

      showToast(`✅ Applied! +${task.skills_required?.length} badge(s)`, '#00ff88');

      // Try to sync immediately if online
      if (navigator.onLine) flushSyncQueue();

    } else {
      showToast('👋 Skipped', '#666');
    }
  };

  const visible = tasks.filter(t => !gone.includes(t.id));
  const allDone = tasks.length > 0 && visible.length === 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', minHeight: '100vh',
      background: '#0d0d1a', padding: '60px 20px 20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ color: '#fff', fontSize: 28, margin: '0 0 4px' }}>
        Task<span style={{ color: '#a855f7' }}>Bridge</span>
      </h1>
      <p style={{ color: '#555', fontSize: 14, margin: '0 0 32px' }}>
        {visible.length} tasks available
      </p>

      {/* Card Stack */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 360, height: 460 }}>
        {allDone ? (
          <div style={{ textAlign: 'center', color: '#555', paddingTop: 120 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <p style={{ fontSize: 18, color: '#fff' }}>All caught up!</p>
            <p style={{ fontSize: 14 }}>Check back for more tasks</p>
          </div>
        ) : (
          visible.slice(-3).map((task, i, arr) => (
            <TaskCard
              key={task.id}
              task={task}
              onSwipe={handleSwipe}
              style={{
                zIndex: i,
                transform: `scale(${0.92 + i * 0.04}) translateY(${(arr.length - 1 - i) * -12}px)`,
                pointerEvents: i === arr.length - 1 ? 'auto' : 'none'
              }}
            />
          ))
        )}
      </div>

      {/* Swipe hint buttons */}
      {!allDone && (
        <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
          <button onClick={() => visible.length && handleSwipe('left', visible[visible.length - 1])}
            style={{ width: 56, height: 56, borderRadius: '50%', background: '#2d1b1b', border: '2px solid #ff4444', color: '#ff4444', fontSize: 22, cursor: 'pointer' }}>
            ✗
          </button>
          <button onClick={() => visible.length && handleSwipe('right', visible[visible.length - 1])}
            style={{ width: 56, height: 56, borderRadius: '50%', background: '#1b2d1b', border: '2px solid #00ff88', color: '#00ff88', fontSize: 22, cursor: 'pointer' }}>
            ✓
          </button>
        </div>
      )}

      {/* Badges earned */}
      {badges.length > 0 && (
        <div style={{ marginTop: 32, width: '100%', maxWidth: 360 }}>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
            🏅 Skill Badges Earned ({badges.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {badges.map((b, i) => (
              <div key={i} style={{
                background: '#1a1a2e', border: '1px solid #a855f7',
                borderRadius: 12, padding: '6px 12px', fontSize: 12, color: '#a855f7'
              }}>
                {b.skill} · {b.verifiable_hash}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          background: toast.color === '#00ff88' ? '#0d2e1a' : '#1a1a1a',
          border: `1px solid ${toast.color}`,
          color: toast.color, padding: '12px 24px',
          borderRadius: 20, fontSize: 15, fontWeight: 600,
          zIndex: 9999, whiteSpace: 'nowrap'
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}