import axios from 'axios';

const ADDR_CONFIG = {
  TORRENTIO: 'https://torrentio.strem.fun',
  ANIMESTREAM: 'https://anime-kitsu.strem.fun',
  FLIXSTREAM: 'https://flixstream.com',
  MSUBTITLES: 'https://msubtitles.strem.fun',
  OPENSUBTITLES_V3: 'https://opensubtitles-v3.strem.io',
  CINEMETA: 'https://v3-cinemeta.strem.io',
  USER_AGENT: 'Stremio/1.6.11',
};

const apiClient = axios.create({
  headers: { 'User-Agent': ADDR_CONFIG.USER_AGENT },
  timeout: 10000,
});

const AddonManager = {
  /**
   * Fetch Metadata chuyên sâu từ Cinemeta
   */
  async fetchMetadata(query, type = 'movie') {
    try {
      const url = `${ADDR_CONFIG.CINEMETA}/catalog/${type}/top/search=${encodeURIComponent(query)}.json`;
      const response = await apiClient.get(url);
      return (response.data.metas || []).map(meta => ({
        id: meta.imdb_id || meta.id,
        name: meta.name,
        poster: meta.poster,
        background: meta.background,
        year: meta.year,
        description: meta.description,
        type: meta.type,
        genres: meta.genres || [],
        releaseInfo: meta.releaseInfo
      }));
    } catch (error) {
      console.error('[AddonManager] Metadata Error:', error.message);
      return [];
    }
  },

  /**
   * Gọi song song các Provider Stream (Torrentio, AnimeStream)
   */
  async fetchStreams(type, id) {
    const endpoints = [
      `${ADDR_CONFIG.TORRENTIO}/stream/${type}/${id}.json`,
      `${ADDR_CONFIG.ANIMESTREAM}/stream/${type}/${id}.json`,
    ];

    const results = await Promise.allSettled(endpoints.map(url => apiClient.get(url)));
    
    const allStreams = results.reduce((acc, result) => {
      if (result.status === 'fulfilled' && result.value.data.streams) {
        return [...acc, ...result.value.data.streams];
      }
      return acc;
    }, []);

    return allStreams.map(s => {
      const isMagnet = !!s.infoHash;
      const resolution = s.title?.match(/\b(2160p|1080p|720p|480p)\b/i)?.[0] || 'Unknown';
      
      return {
        title: s.title || 'Unknown Source',
        name: s.name,
        infoHash: s.infoHash,
        url: isMagnet ? `magnet:?xt=urn:btih:${s.infoHash}` : s.url,
        type: isMagnet ? 'magnet' : 'http',
        resolution: resolution,
        size: s.title?.match(/(\d+(\.\d+)?\s*(GB|MB))/i)?.[0] || '',
      };
    }).sort((a, b) => {
      const resMap = { '2160p': 4, '1080p': 3, '720p': 2, '480p': 1, 'Unknown': 0 };
      return resMap[b.resolution] - resMap[a.resolution];
    });
  },

  /**
   * Lấy phụ đề từ nhiều nguồn (MSubtitles, OpenSubtitles v3)
   */
  async fetchSubtitles(type, id) {
    const endpoints = [
      `${ADDR_CONFIG.MSUBTITLES}/subtitles/${type}/${id}.json`,
      `${ADDR_CONFIG.OPENSUBTITLES_V3}/subtitles/${type}/${id}.json`,
    ];

    try {
      const results = await Promise.allSettled(endpoints.map(url => apiClient.get(url)));
      
      const allSubs = results.reduce((acc, result) => {
        if (result.status === 'fulfilled' && result.value.data.subtitles) {
          return [...acc, ...result.value.data.subtitles];
        }
        return acc;
      }, []);

      // Lọc tiếng Việt và chuẩn hóa định dạng
      return allSubs
        .filter(sub => sub.lang === 'vie' || sub.id?.toLowerCase().includes('vietnamese'))
        .map((sub, index) => ({
          id: `sub_${index}_${sub.id || Math.random()}`,
          label: sub.label || `Vietnamese #${index + 1}`,
          uri: sub.url,
          type: sub.url?.endsWith('.srt') ? 'application/x-subrip' : 'text/vtt',
          language: 'vi'
        }));
    } catch (error) {
      console.error('[AddonManager] Subtitles Fetch Error:', error.message);
      return [];
    }
  }
};

export default AddonManager;
