# Skills Amplifier PWA (taskmixer) - Local-First Micro-Task Platform

## 📱 Prototype Overview

A Progressive Web App that enables youth to discover and complete micro-tasks completely offline, with intelligent sync when connectivity is restored. Built for the 48-hour hackathon challenge.

**Core Value Proposition:** "Your skills, verified offline. Opportunities, always available."

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (PWA)                       │
├─────────────────────────────────────────────────────┤
│  React UI (Vite + Tailwind)                          │
│  └─ Offline indicators, optimistic updates           │
│                                                       │
│  Service Worker                                       │
│  ├─ Caches static assets                             │
│  ├─ Network-first API strategy                        │
│  └─ Background sync registration                      │
│                                                       │
│  IndexedDB (Dexie.js)                                 │
│  ├─ tasks     (available offline)                     │
│  ├─ applications (pending sync)                       │
│  ├─ completed_tasks                                   │
│  └─ sync_queue  (retry logic)                         │
│                                                       │
│  Go WASM Module (Optional)                            │
│  └─ Version vector conflict detection                 │
└─────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────┐
│                   BACKEND (Mock)                      │
├─────────────────────────────────────────────────────┤
│  Express.js API                                       │
│  ├─ GET  /api/tasks                                   │
│  ├─ POST /api/applications                            │
│  └─ POST /api/sync                                     │
│                                                       │
│  MongoDB (Optional)                                    │
│  └─ Persistent storage                                 │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Key Features Demonstrated

### 1. **Complete Offline Functionality**
- Browse cached tasks without internet
- Submit applications while offline
- All data persists in IndexedDB
- Clear visual indicators of connection status

### 2. **Intelligent Sync Behavior**
- Background sync when connection returns
- Queue management for failed operations
- Retry with exponential backoff
- No data loss during network interruptions

### 3. **Failure Recovery**
| Scenario | Handling Strategy |
|----------|-------------------|
| Network drops mid-sync | Operations remain in queue, retry on reconnect |
| Server returns 500 | Exponential backoff (2s, 4s, 8s...) |
| App closed during write | Transaction rollback, data integrity maintained |
| Device storage full | Proactive warning, cache cleanup option |

### 4. **Bonus: Conflict Resolution** (Optional)
- Version vector tracking for concurrent edits
- Last-write-wins merge strategy
- Go WASM module for sophisticated sync logic

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + Vite | Fast development, optimal builds |
| PWA | Vite PWA Plugin | Manifest, service worker generation |
| Local Storage | Dexie.js (IndexedDB) | Offline data persistence |
| State Sync | Service Worker + Background Sync | Offline operation queue |
| Conflict Resolution | Go + WebAssembly (WASM) | Advanced sync logic (bonus) |
| Styling | Tailwind CSS | Rapid UI development |

---

## 📁 Project Structure

```
skills-amplifier/
├── index.html
├── package.json
├── vite.config.js          # PWA plugin config
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── icon-192.png        # App icons
│   └── icon-512.png
├── src/
│   ├── main.jsx           # Entry point
│   ├── db.js              # IndexedDB schema & operations
│   ├── service-worker.js   # Service worker logic
│   ├── App.jsx            # Main component
│   └── components/
│       ├── TaskList.jsx    # Offline-first task display
│       ├── OfflineIndicator.jsx
│       └── SyncStatus.jsx
├── go/                    # Go WASM module (optional)
│   ├── sync.go           # Conflict resolution logic
│   └── build.sh          # WASM build script
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Chrome/Firefox with dev tools

### Installation

```bash
# Clone repository
git clone <your-repo>
cd skills-amplifier

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Testing Offline Mode

1. Open Chrome Dev Tools (F12)
2. Go to **Application** tab → **Service Workers**
3. Check "Offline" checkbox
4. Or use Network tab → Throttle → "Offline"

### Simulating Poor Connectivity

1. Dev Tools → **Network** tab
2. Throttle dropdown → "Slow 2G" or "Offline"
3. Test all features remain functional

---

## 📊 Demo Script for Judges

### Part 1: Online Operation (30 seconds)
- Load app, show task list fetched from API
- Apply for a task → immediate success

### Part 2: Go Offline (60 seconds)
```javascript
// Turn off WiFi / enable offline mode
```
- App still shows cached tasks
- Submit new application while offline
- Open Application tab → IndexedDB → show pending in sync_queue

### Part 3: Demonstrate Sync (30 seconds)
```javascript
// Reconnect internet
```
- Background sync triggers automatically
- Pending item disappears from queue
- Task appears in "My Applications"

### Part 4: Failure Recovery (60 seconds)
- **Scenario:** Server down during sync
  - Show retry queue with exponential backoff
  - Simulate server 500 error
  - Demonstrate sync resumes when server recovers

### Part 5: Bonus Round (Optional)
- Show conflict detection with two offline devices
- Demonstrate Go WASM version vector comparison
- Show elegant merge UI

---

## 🎯 How We Meet Judging Criteria

| Criteria | Our Implementation |
|----------|-------------------|
| **Local-First Architecture (25%)** | IndexedDB as primary data source; writes succeed offline; sync is background process |
| **Reliability Under Failure (25%)** | Queue persistence; transaction integrity; retry strategies for all failure scenarios |
| **Technical Depth (20%)** | Background sync; exponential backoff; version vectors; Go WASM integration |
| **UX & Usability (15%)** | Clear offline indicators; optimistic updates; non-blocking operations |
| **Code Quality (15%)** | Modular architecture; separation of concerns; well-documented functions |

---

## 🔧 Configuration Options

### Service Worker Caching Strategy

```javascript
// vite.config.js
runtimeCaching: [
  {
    urlPattern: /^https:\/\/api\./i,
    handler: 'NetworkFirst',  // Try network, fallback to cache
    options: {
      cacheName: 'api-cache',
      expiration: { maxEntries: 50 }
    }
  },
  {
    urlPattern: /\.(js|css|html|png)$/,
    handler: 'CacheFirst',     // Serve from cache first
    options: {
      cacheName: 'static-assets'
    }
  }
]
```

### Sync Retry Configuration

```javascript
// Background sync registration
const registerSync = async () => {
  const registration = await navigator.serviceWorker.ready;
  
  // Exponential backoff: 2s, 4s, 8s, 16s...
  await registration.backgroundSync.register('sync-tasks', {
    minInterval: 2000,
    maxRetries: 5
  });
};
```

---

## 🧪 Test Scenarios

### Run these before demo:

- [ ] App installs as PWA (manifest.json valid)
- [ ] Loads offline with no network
- [ ] Caches tasks for offline browsing
- [ ] Submits applications offline
- [ ] Syncs automatically when online
- [ ] Recovers from server errors
- [ ] Handles multiple offline operations
- [ ] Maintains data integrity if closed during sync

---

## 🚨 Known Limitations (MVP)

- No user authentication (simulated)
- Basic conflict resolution (LWW)
- Limited to task applications only
- No real-time updates

---

## 🔮 Future Enhancements

- QR code skill badges (verifiable offline)
- Mesh networking sync between devices
- CRDT-based conflict resolution
- End-to-end encryption for offline data
- Battery-aware sync scheduling
- Partial sync based on location

---

## 📚 Resources Used

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Dexie.js - IndexedDB Wrapper](https://dexie.org/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- [Go WebAssembly](https://github.com/golang/go/wiki/WebAssembly)

---

## 👥 Team

**Skills Amplifier Team**
- bkoimett - React/PWA
- bkoimett - Service Worker/Offline Logic
- bkoimett - Go WASM/Backend
- bkoimett - UI/UX
- bkoimett - Testing/Documentation

# the one man army of devops

---

## 📝 License

MIT - Open source for hackathon submission

---

**Built for 48-Hour Hackathon: "Local First: Build our Reality"**  
*February 27-28, 2026*
