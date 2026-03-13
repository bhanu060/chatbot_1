<div align="center">

# 🛡️ Tactical Face Detection System

A real-time facial recognition and suspect detection dashboard built with React, face-api.js, and Tailwind CSS.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss)

</div>

---

## ✨ Features

- 🎥 **Live Camera Feed** — Real-time face detection via webcam
- 🖼️ **Image/Sketch Scanner** — Upload any photo or sketch to scan
- 👤 **Suspect Database** — Enroll subjects with face descriptors stored in IndexedDB
- 🎯 **Face Matching** — Matches detected faces against the database (60% threshold)
- 🟥🟡🟢 **Threat Levels** — RED (wanted), YELLOW (person of interest), GREEN (cleared)
- 📋 **Event Log** — Live timestamped log of matches, unknowns, and system events
- 🤖 **AI Profiling** — Auto-generates physical descriptions for unknown subjects (works offline, no API key needed)
- 💾 **Persistent Storage** — All data stored locally in IndexedDB (no backend required)

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/tactical-face-detection.git
cd tactical-face-detection

# 2. Install dependencies
npm install

# 3. (Optional) Add Gemini API key for real AI profiling
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY=your_key_here

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000

> **No API key required.** The app works fully offline. The AI profiler uses a built-in local description generator when no Gemini key is provided.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── CameraFeed.tsx       # Live webcam + face detection overlay
│   ├── ImageScanner.tsx     # Static image upload + scan
│   ├── SuspectPanel.tsx     # Left panel: suspect database list
│   ├── EventLog.tsx         # Right panel: system event log
│   └── AddSuspectModal.tsx  # Modal: enroll new subject via webcam
├── lib/
│   ├── db.ts                # IndexedDB operations (idb)
│   └── utils.ts             # Tailwind class merge utility
├── services/
│   └── geminiService.ts     # AI profiling (offline by default)
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🔧 Build for Production

```bash
npm run build
# Output in /dist — deploy to GitHub Pages, Netlify, Vercel, etc.
```

---

## 🌐 Deploy to GitHub Pages

```bash
npm run build
# Then push /dist contents to your gh-pages branch, or use:
npx gh-pages -d dist
```

---

## 📜 License

Apache-2.0
