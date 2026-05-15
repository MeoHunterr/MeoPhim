import {Platform} from 'react-native';
import {Buffer} from 'buffer';
import process from 'process';

if (typeof __dirname === 'undefined') global.__dirname = '/';
if (typeof __filename === 'undefined') global.__filename = '';
if (typeof process === 'undefined') {
  global.process = process;
} else {
  const bProcess = require('process');
  for (var p in bProcess) {
    if (!(p in process)) process[p] = bProcess[p];
  }
}

process.browser = false;
if (typeof Buffer === 'undefined') global.Buffer = Buffer;

// Fix for some libraries that expect global.location
if (typeof location === 'undefined') {
  global.location = {
    protocol: 'file:',
  };
}

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
if (!isDev) {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
}

// Polyfill for TextEncoder/TextDecoder if missing
import { TextEncoder, TextDecoder } from 'text-encoding';
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Polyfill for localStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
if (typeof global.localStorage === 'undefined') {
  global.localStorage = AsyncStorage;
}
