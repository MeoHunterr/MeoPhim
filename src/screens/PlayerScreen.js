import React, { useState, useRef, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, SafeAreaView, Modal, FlatList, Alert } from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import TorrentBridge from '../services/TorrentBridge';
import { useStore } from '../store';

const { width, height } = Dimensions.get('window');

// Memoize Stats Component để không làm lag Video khi re-render mỗi giây
const StatsOverlay = memo(({ stats, showStats }) => {
  if (!showStats || !stats) return null;
  return (
    <View className="absolute top-12 right-6 bg-black/60 p-3 rounded-xl border border-white/10">
      <Text className="text-green-400 font-mono text-[10px]">SPEED: {stats.downloadSpeed}</Text>
      <Text className="text-indigo-400 font-mono text-[10px]">PEERS: {stats.numPeers}</Text>
      <Text className="text-white font-mono text-[10px]">PROG: {stats.progress}</Text>
    </View>
  );
});

const PlayerScreen = ({ route, navigation }) => {
  const { url, subtitles, isTorrent, title, id } = route.params;
  
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedSub, setSelectedSub] = useState(subtitles?.length > 0 ? 0 : -1);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [showStats, setShowStats] = useState(isTorrent);
  const [isSeekingToLastPos, setIsSeekingToLastPos] = useState(false);

  const setPlaybackPosition = useStore(state => state.setPlaybackPosition);
  const getPlaybackPosition = useStore(state => state.getPlaybackPosition);

  useEffect(() => {
    // Ép xoay ngang khi vào màn hình này
    Orientation.lockToLandscape();

    if (isTorrent) {
      const statsListener = (data) => setStats(data);
      TorrentBridge.on('stats', statsListener);
      return () => {
        TorrentBridge.stop(); 
        Orientation.lockToPortrait(); // Trả về xoay dọc khi thoát
      };
    }

    return () => {
      Orientation.lockToPortrait(); // Trả về xoay dọc khi thoát
    };
  }, [isTorrent]);

  // Cập nhật tiến trình xem mỗi 5 giây vào store
  useEffect(() => {
    if (currentTime > 0 && !loading) {
      setPlaybackPosition(id, currentTime);
    }
  }, [Math.floor(currentTime / 5)]);

  useEffect(() => {
    let timer;
    if (showControls && !paused) {
      timer = setTimeout(() => setShowControls(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [showControls, paused]);

  const onVideoLoad = (data) => {
    setDuration(data.duration);
    setLoading(false);

    // Khôi phục tiến trình xem
    const lastPos = getPlaybackPosition(id);
    if (lastPos > 10 && lastPos < data.duration - 30) {
      setIsSeekingToLastPos(true);
      videoRef.current?.seek(lastPos);
      setTimeout(() => setIsSeekingToLastPos(false), 1000);
    }
  };

  const handleSeek = (offset) => {
    videoRef.current?.seek(currentTime + offset);
  };

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <View className="flex-1 bg-black">
      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={StyleSheet.absoluteFill}
        paused={paused}
        resizeMode="contain"
        onLoad={onVideoLoad}
        onProgress={(p) => setCurrentTime(p.currentTime)}
        onBuffer={({ isBuffering }) => setLoading(isBuffering)}
        textTracks={subtitles}
        selectedTextTrack={{
          type: selectedSub === -1 ? 'disabled' : 'index',
          value: selectedSub
        }}
      />

      <StatsOverlay stats={stats} showStats={showStats} />

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-black/40">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-white mt-4 font-black tracking-widest text-xs uppercase">Đang tải luồng dữ liệu...</Text>
        </View>
      )}

      {/* Control Layer */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={() => setShowControls(true)} 
        className="absolute inset-0"
      >
        {showControls && (
          <SafeAreaView className="flex-1 bg-black/40 justify-between p-6">
            {/* Top Bar */}
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
                <Text className="text-white text-2xl">✕</Text>
              </TouchableOpacity>
              <Text className="text-white font-bold flex-1 text-center" numberOfLines={1}>{title}</Text>
              <TouchableOpacity onPress={() => setShowStats(!showStats)} className="w-10 h-10 items-center justify-center">
                <Text className="text-white text-xs font-bold">INFO</Text>
              </TouchableOpacity>
            </View>

            {/* Middle Controls */}
            <View className="flex-row justify-center items-center space-x-12">
              <TouchableOpacity onPress={() => handleSeek(-10)} className="items-center">
                <Text className="text-white text-3xl font-bold">↺</Text>
                <Text className="text-white text-[10px]">10s</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setPaused(!paused)}
                className="w-20 h-20 bg-indigo-600 rounded-full items-center justify-center shadow-2xl shadow-indigo-500"
              >
                <Text className="text-white text-4xl">{paused ? '▶' : 'Ⅱ'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSeek(10)} className="items-center">
                <Text className="text-white text-3xl font-bold">↻</Text>
                <Text className="text-white text-[10px]">10s</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-[10px] font-bold">{formatTime(currentTime)}</Text>
                <Text className="text-white text-[10px] font-bold">{formatTime(duration)}</Text>
              </View>
              
              {/* Progress Slider Placeholder */}
              <View className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-6">
                <View 
                  className="h-full bg-indigo-500" 
                  style={{ width: `${(currentTime / duration) * 100}%` }} 
                />
              </View>

              <View className="flex-row justify-end space-x-4">
                <TouchableOpacity 
                  onPress={() => setSubModalVisible(true)}
                  className="bg-slate-800 px-4 py-2 rounded-xl border border-white/10"
                >
                  <Text className="text-white text-xs font-bold uppercase">Phụ Đề</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        )}
      </TouchableOpacity>

      {/* Subtitle Selection Modal */}
      <Modal transparent visible={subModalVisible} animationType="fade">
        <TouchableOpacity 
          className="flex-1 bg-black/80 justify-center items-center p-10"
          onPress={() => setSubModalVisible(false)}
        >
          <View className="bg-slate-900 w-full rounded-3xl p-6 border border-white/10">
            <Text className="text-white text-xl font-black mb-4 text-center">Chọn Phụ Đề</Text>
            <TouchableOpacity 
              onPress={() => { setSelectedSub(-1); setSubModalVisible(false); }}
              className={`p-4 rounded-xl mb-2 ${selectedSub === -1 ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <Text className="text-white font-bold text-center">Tắt phụ đề</Text>
            </TouchableOpacity>
            <FlatList
              data={subtitles}
              keyExtractor={(s) => s.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  onPress={() => { setSelectedSub(index); setSubModalVisible(false); }}
                  className={`p-4 rounded-xl mb-2 ${selectedSub === index ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <Text className="text-white font-bold text-center">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default PlayerScreen;
