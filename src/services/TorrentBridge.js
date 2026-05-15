import './globals'; // Inject Polyfills đầu tiên
import WebTorrent from 'webtorrent';
import RNFS from 'react-native-fs';
import StaticServer from 'react-native-static-server';
import { EventEmitter } from 'events';

class TorrentBridge extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.server = null;
    this.currentTorrent = null;
    this.port = 8888;
    this.cachePath = `${RNFS.CachesDirectoryPath}/meophim_vcache`;
  }

  /**
   * Khởi tạo WebTorrent Client với TCP/UDP Sockets
   */
  initClient() {
    if (!this.client) {
      this.client = new WebTorrent({
        // WebTorrent sẽ tự động sử dụng 'net' và 'dgram' đã được Metro polyfill sang tcp-socket và udp
        maxConns: 50,
      });
    }
  }

  async startStream(magnetUri) {
    this.initClient();
    this.stop(); // Dọn dẹp phiên cũ

    return new Promise(async (resolve, reject) => {
      try {
        // Đảm bảo thư mục cache tồn tại
        if (!(await RNFS.exists(this.cachePath))) {
          await RNFS.mkdir(this.cachePath);
        }

        console.log('[TorrentBridge] Adding torrent:', magnetUri);

        this.client.add(magnetUri, { path: this.cachePath }, (torrent) => {
          this.currentTorrent = torrent;

          // Tìm file video
          const file = torrent.files.find(f => /\.(mp4|mkv|avi|mov)$/i.test(f.name)) || torrent.files[0];

          // Ưu tiên tải tuần tự (Sequential)
          file.select();
          
          // Tạo HTTP Server để stream dữ liệu
          // WebTorrent Web API createServer() tạo ra một Node-style server
          // Trong RN, ta cần ánh xạ dữ liệu này qua StaticServer hoặc dùng stream trực tiếp nếu hỗ trợ
          // Ở đây ta dùng giải pháp StaticServer stream từ file đang tải
          
          if (!this.server) {
            // StaticServer trong RN thường dùng để phục vụ file tĩnh
            // Để stream P2P hiệu quả, ta sử dụng server tích hợp của WebTorrent (đã được polyfill net/http)
            const torrentServer = torrent.createServer();
            torrentServer.listen(this.port, '127.0.0.1', () => {
              const streamUrl = `http://127.0.0.1:${this.port}/0`;
              console.log('[TorrentBridge] Streaming at:', streamUrl);
              resolve(streamUrl);
            });
            this.server = torrentServer;
          }

          torrent.on('download', () => {
            this.emit('stats', {
              downloadSpeed: (torrent.downloadSpeed / 1024 / 1024).toFixed(2) + ' MB/s',
              progress: (torrent.progress * 100).toFixed(1) + '%',
              numPeers: torrent.numPeers,
            });
          });
        });
      } catch (err) {
        console.error('[TorrentBridge] Start Error:', err);
        reject(err);
      }
    });
  }

  stop() {
    if (this.currentTorrent) {
      this.currentTorrent.destroy();
      this.currentTorrent = null;
    }
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    // Không xóa cachePath ở đây để tránh crash khi đang đóng
  }
}

export default new TorrentBridge();
