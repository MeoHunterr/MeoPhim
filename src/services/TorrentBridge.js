import WebTorrent from 'react-native-webtorrent';
import RNFS from 'react-native-fs';
import { EventEmitter } from 'events';

class TorrentBridge extends EventEmitter {
  constructor() {
    super();
    this.client = new WebTorrent({
      maxConns: 50, // Tối ưu băng thông 4G/5G, không quá cao gây nghẽn
      downloadLimit: -1, // Không giới hạn tốc độ tải
      uploadLimit: 512 * 1024, // Giới hạn upload 500KB/s để tiết kiệm pin & CPU
      tracker: true,
      dht: true,
      webSeeds: false, // Tắt webseeds nếu không dùng đến để giảm overhead mạng
    });
    this.server = null;
    this.currentTorrent = null;
    this.cachePath = `${RNFS.CachesDirectoryPath}/meophim_vcache`;
    this.port = 8888;
  }

  async startStream(magnetUri) {
    return new Promise((resolve, reject) => {
      // 1. Dọn dẹp torrent cũ và cache dư thừa
      this.stop();

      console.log('[TorrentBridge] Initiating magnet:', magnetUri);

      this.client.add(magnetUri, { path: this.cachePath }, (torrent) => {
        this.currentTorrent = torrent;

        // 2. Tìm file video chính
        const file = torrent.files.find(f => 
          /\.(mp4|mkv|avi|mov)$/i.test(f.name)
        ) || torrent.files[0];

        // 3. TRIỂN KHAI SEQUENTIAL SELECTION
        // Trong engine webtorrent, việc gọi file.select() với ưu tiên cao 
        // và createReadStream (của server) sẽ ép tải các piece đầu.
        file.select(); 
        
        // 4. Khởi tạo HTTP Server hỗ trợ Range Requests
        this.server = torrent.createServer();
        this.server.listen(this.port, () => {
          const streamUrl = `http://localhost:${this.port}/0`;
          console.log('[TorrentBridge] Server active at:', streamUrl);
          resolve(streamUrl);
        });

        // 5. Phát tín hiệu stats thời gian thực
        torrent.on('download', () => {
          this.emit('stats', {
            downloadSpeed: (torrent.downloadSpeed / 1024 / 1024).toFixed(2) + ' MB/s',
            progress: (torrent.progress * 100).toFixed(1) + '%',
            numPeers: torrent.numPeers,
            downloaded: (torrent.downloaded / 1024 / 1024).toFixed(1) + ' MB',
          });
        });

        // Xử lý lỗi trong quá trình tải
        torrent.on('error', (err) => {
          console.error('[TorrentBridge] Torrent Error:', err);
          this.emit('error', err);
        });
      });

      this.client.on('error', (err) => {
        console.error('[TorrentBridge] Client Error:', err);
        reject(err);
      });
    });
  }

  stop() {
    try {
      if (this.currentTorrent) {
        this.currentTorrent.destroy();
        this.currentTorrent = null;
      }
      if (this.server) {
        this.server.close();
        this.server = null;
      }
      // Xóa cache để bảo vệ bộ nhớ iPhone
      RNFS.exists(this.cachePath).then(exists => {
        if (exists) RNFS.unlink(this.cachePath).catch(() => {});
      });
      this.removeAllListeners('stats');
    } catch (e) {
      console.warn('[TorrentBridge] Stop Error:', e);
    }
  }
}

// Singleton pattern
const instance = new TorrentBridge();
export default instance;
