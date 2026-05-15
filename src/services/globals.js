import { Buffer } from 'buffer';
import process from 'process';

global.Buffer = Buffer;
global.process = process;
global.process.browser = true;

// Fix cho WebTorrent và các module Node.js
if (typeof btoa === 'undefined') {
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof atob === 'undefined') {
  global.atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');
}
