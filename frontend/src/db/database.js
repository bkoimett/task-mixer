import Dexie from 'dexie';

export const db = new Dexie('TaskBridge');

db.version(1).stores({
  tasks:      'id, category, status, cached_at',
  applications: 'id, task_id, synced, created_at',
  sync_queue: '++id, action, created_at, retry_count',
  badges:     '++id, skill, earned_at'
});

// Seed local DB from server, called on app load when online
export async function cacheTasks() {
  try {
    const res = await fetch('http://localhost:8080/api/tasks');
    const tasks = await res.json();
    const stamped = tasks.map(t => ({ ...t, cached_at: Date.now() }));
    await db.tasks.bulkPut(stamped);
    console.log(`✅ Cached ${tasks.length} tasks locally`);
  } catch (e) {
    console.log('📴 Offline — using cached tasks');
  }
}

// Add action to sync queue
export async function queueAction(action, payload) {
  await db.sync_queue.add({
    action,
    payload,
    created_at: Date.now(),
    retry_count: 0,
    last_error: null
  });
}

// Generate a verifiable skill badge locally
export async function generateBadge(skill, taskId, userId = 'user_001') {
  const raw = `${userId}:${taskId}:${skill}:${Date.now()}`;
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(raw)
  );
  const hex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').slice(0, 16).toUpperCase();

  const badge = {
    skill,
    task_id: taskId,
    earned_at: Date.now(),
    verifiable_hash: hex
  };

  await db.badges.add(badge);
  return badge;
}