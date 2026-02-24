import { useEffect } from 'react';
import { initSyncEngine } from './sync/syncEngine';
import SwipeStack from './components/SwipeStack';
import SyncBadge from './components/SyncBadge';

export default function App() {
  useEffect(() => {
    initSyncEngine();
  }, []);

  return (
    <>
      <SyncBadge />
      <SwipeStack />
    </>
  );
}