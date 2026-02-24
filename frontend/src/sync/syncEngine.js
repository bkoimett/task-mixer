import { db, cacheTasks } from '../db/database';

const API = 'http://localhost:8080/api';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

export async function flushSyncQueue() {
  const pending = await db.sync_queue.toArray();
  if (pending.length === 0) return;

  console.log(`🔄 Flushing ${pending.length} queued actions...`);

  try {
    const res = await fetch(`${API}/sync/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pending)
    });

    if (res.ok) {
      const ids = pending.map(p => p.id);
      await db.sync_queue.bulkDelete(ids);

      // Mark applications as synced
      const appActions = pending.filter(p => p.action === 'APPLY');
      for (const a of appActions) {
        await db.applications
          .where('task_id').equals(a.payload.task_id)
          .modify({ synced: true });
      }

      console.log(`✅ Synced ${pending.length} actions`);
      // Tell the UI to refresh
      window.dispatchEvent(new CustomEvent('sync-complete'));
    }
  } catch (e) {
    console.log('❌ Sync failed, will retry:', e.message);
    for (const item of pending) {
      await db.sync_queue.update(item.id, {
        retry_count: (item.retry_count || 0) + 1,
        last_error: e.message
      });
    }
  }
}

// Actively polls backend — more reliable than trusting navigator.onLine
async function isBackendReachable() {
  try {
    const res = await fetch(`${API}/tasks`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export function initSyncEngine() {
  // Try sync whenever browser thinks we're online
  window.addEventListener('online', async () => {
    console.log('🌐 Browser online event fired');
    const reachable = await isBackendReachable();
    if (reachable) {
      await cacheTasks();
      await flushSyncQueue();
    }
  });

  // ← THIS IS THE KEY FIX: poll every 5 seconds regardless of online event
  setInterval(async () => {
    const pending = await db.sync_queue.count();
    if (pending === 0) return; // nothing to do

    const reachable = await isBackendReachable();
    if (reachable) {
      console.log('🔁 Poller detected backend — flushing queue');
      await cacheTasks();
      await flushSyncQueue();
    }
  }, 5000);

  // Initial cache if online
  if (navigator.onLine) cacheTasks();
}