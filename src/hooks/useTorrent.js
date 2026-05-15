import { useState, useEffect } from 'react';
import TorrentBridge from '../services/TorrentBridge';

export const useTorrent = (isTorrent) => {
  const [stats, setStats] = useState({
    downloadSpeed: '0 MB/s',
    progress: '0%',
    numPeers: 0,
    downloaded: '0 MB',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isTorrent) return;

    const onStats = (data) => setStats(data);
    const onError = (err) => setError(err);

    TorrentBridge.on('stats', onStats);
    TorrentBridge.on('error', onError);

    return () => {
      TorrentBridge.removeListener('stats', onStats);
      TorrentBridge.removeListener('error', onError);
    };
  }, [isTorrent]);

  return { stats, error };
};
