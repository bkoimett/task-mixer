import { useState } from 'react';

const CATEGORY_COLORS = {
  Design: '#a855f7',
  Writing: '#3b82f6',
  'Social Media': '#ec4899',
  Admin: '#f59e0b',
  Digital: '#10b981'
};

export default function TaskCard({ task, onSwipe, style }) {
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [decision, setDecision] = useState(null); // 'apply' | 'skip'

  const color = CATEGORY_COLORS[task.category] || '#6366f1';
  const deadline = new Date(task.deadline).toLocaleDateString('en-KE', {
    month: 'short', day: 'numeric'
  });

  const handleStart = (x) => { setDragging(true); setStartX(x); };
  const handleMove = (x) => {
    if (!dragging) return;
    const diff = x - startX;
    setOffsetX(diff);
    if (diff > 60) setDecision('apply');
    else if (diff < -60) setDecision('skip');
    else setDecision(null);
  };
  const handleEnd = () => {
    if (offsetX > 80) onSwipe('right', task);
    else if (offsetX < -80) onSwipe('left', task);
    setDragging(false);
    setOffsetX(0);
    setDecision(null);
  };

  const rotation = offsetX * 0.08;
  const applyOpacity = Math.min(offsetX / 80, 1);
  const skipOpacity = Math.min(-offsetX / 80, 1);

  return (
    <div
      onMouseDown={e => handleStart(e.clientX)}
      onMouseMove={e => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={e => handleStart(e.touches[0].clientX)}
      onTouchMove={e => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      style={{
        position: 'absolute',
        width: '100%', maxWidth: 360,
        background: '#1a1a2e',
        border: `1px solid ${color}33`,
        borderRadius: 20,
        padding: 24,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        transition: dragging ? 'none' : 'transform 0.3s ease',
        boxShadow: `0 8px 32px ${color}22`,
        ...style
      }}
    >
      {/* Apply stamp */}
      <div style={{
        position: 'absolute', top: 24, left: 20,
        border: '3px solid #00ff88', borderRadius: 8,
        color: '#00ff88', padding: '4px 12px',
        fontSize: 20, fontWeight: 900,
        transform: 'rotate(-15deg)',
        opacity: applyOpacity, transition: 'opacity 0.1s'
      }}>APPLY ✓</div>

      {/* Skip stamp */}
      <div style={{
        position: 'absolute', top: 24, right: 20,
        border: '3px solid #ff4444', borderRadius: 8,
        color: '#ff4444', padding: '4px 12px',
        fontSize: 20, fontWeight: 900,
        transform: 'rotate(15deg)',
        opacity: skipOpacity, transition: 'opacity 0.1s'
      }}>SKIP ✗</div>

      {/* Category pill */}
      <div style={{
        display: 'inline-block',
        background: `${color}22`, color,
        border: `1px solid ${color}`,
        borderRadius: 20, padding: '4px 12px',
        fontSize: 12, fontWeight: 600, marginBottom: 12
      }}>{task.category}</div>

      <h2 style={{ margin: '0 0 4px', fontSize: 22, color: '#fff' }}>
        {task.title}
      </h2>
      <p style={{ margin: '0 0 16px', color: '#888', fontSize: 14 }}>
        🏪 {task.business_name}
      </p>
      <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        {task.description}
      </p>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {task.skills_required?.map(s => (
          <span key={s} style={{
            background: '#ffffff11', color: '#ccc',
            borderRadius: 12, padding: '3px 10px', fontSize: 12
          }}>#{s}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#00ff88', fontWeight: 700, fontSize: 16 }}>
          {task.pay_range}
        </span>
        <span style={{ color: '#666', fontSize: 13 }}>
          Due {deadline}
        </span>
      </div>
    </div>
  );
}