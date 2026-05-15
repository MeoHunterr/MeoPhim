# Project Context: iOS Anime Streaming App (TrollStore Compatible)

## 1. Project Overview
We are building a React Native (Bare Workflow) iOS application specifically designed for TrollStore. The app functions as a media center similar to Stremio. It discovers movies/anime, fetches stream links from Torrent/HTTP sources, handles subtitles, and plays video internally.

## 2. Tech Stack
- **Framework:** React Native (Bare Workflow)
- **UI/Styling:** NativeWind (Tailwind CSS)
- **Torrent Engine & Bridge:** `react-native-webtorrent` + Local HTTP Server (`react-native-static-server` or equivalent) to stream torrent pieces sequentially.
- **Video Player:** `react-native-video` (must support `.mkv` and `.ass`/.`srt` subtitles).
- **Network:** `axios` for fetching Addon manifests and metadata.

## 3. Core Features & Addon Ecosystem
The app relies strictly on the Stremio Addon Protocol (JSON-based):
- **Metadata/Search:** Stremio Cinemeta / Kitsu API.
- **Stream Sources:** 
  - Torrentio (`https://torrentio.strem.fun/manifest.json`)
  - AnimeStream (`https://anime-kitsu.strem.fun/manifest.json`)
  - FlixStream (HTTP Direct links)
- **Subtitles:** MSubtitles (`https://msubtitles.strem.fun/manifest.json`) - Specifically filtering for Vietnamese (`vie`).

## 4. Special iOS/TrollStore Considerations
- The app will run on iOS via TrollStore, meaning it bypasses typical App Store restrictions.
- Needs background execution capabilities (audio/fetch) to maintain torrent connections.
- Focus on `priority: high` for sequential piece picking in WebTorrent to allow instant streaming.