import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator, ImageBackground, StyleSheet } from 'react-native';
import AddonManager from '../services/AddonManager';
import TorrentBridge from '../services/TorrentBridge';
import { useStore } from '../store';
import { formatTime } from '../utils/helpers';

const DetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [streams, setStreams] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToHistory = useStore(state => state.addToHistory);
  const lastPos = useStore(state => state.playbackPositions[item.id] || 0);

  const loadSources = async () => {
    setModalVisible(true);
    setLoading(true);
    try {
      const [sData, subData] = await Promise.all([
        AddonManager.fetchStreams(item.type, item.id),
        AddonManager.fetchSubtitles(item.type, item.id)
      ]);
      setStreams(sData);
      setSubtitles(subData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (stream) => {
    setModalVisible(false);
    addToHistory(item); // Lưu vào lịch sử xem
    
    let finalUrl = stream.url;
    if (stream.type === 'magnet') {
      finalUrl = await TorrentBridge.startStream(stream.url);
    }
    
    navigation.navigate('Player', {
      id: item.id,
      url: finalUrl,
      subtitles: subtitles,
      isTorrent: stream.type === 'magnet',
      title: item.name
    });
  };

  const renderStreamItem = ({ item: s }) => (
    <TouchableOpacity 
      className="bg-slate-800/80 mb-3 p-4 rounded-2xl border border-white/5"
      onPress={() => handlePlay(s)}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{s.resolution} - {s.name}</Text>
          <Text className="text-slate-400 text-xs mt-1" numberOfLines={1}>{s.title}</Text>
          {s.size && <Text className="text-indigo-400 text-[10px] mt-1 font-bold">{s.size}</Text>}
        </View>
        <View className={`ml-4 px-3 py-1 rounded-full ${s.type === 'magnet' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
          <Text className={`text-[10px] font-black ${s.type === 'magnet' ? 'text-red-400' : 'text-green-400'}`}>
            {s.type.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-950">
      <ImageBackground 
        source={{ uri: item.background || item.poster }} 
        className="flex-1"
        blurRadius={10}
      >
        <View className="flex-1 bg-black/60">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header / Poster Overlay */}
            <View className="items-center pt-20 pb-10">
              <TouchableOpacity 
                className="absolute top-12 left-6 w-12 h-12 bg-black/40 rounded-full items-center justify-center border border-white/10"
                onPress={() => navigation.goBack()}
              >
                <Text className="text-white text-2xl">←</Text>
              </TouchableOpacity>
              
              <Image 
                source={{ uri: item.poster }} 
                className="w-56 h-80 rounded-3xl shadow-2xl shadow-black"
                resizeMode="cover"
              />
            </View>

            {/* Content Card */}
            <View className="bg-slate-900/90 m-4 p-6 rounded-[40px] border border-white/10 shadow-2xl">
              <Text className="text-white text-3xl font-black text-center">{item.name}</Text>
              <View className="flex-row justify-center space-x-4 mt-3">
                <Text className="text-indigo-400 font-bold">{item.year}</Text>
                <Text className="text-slate-500">|</Text>
                <Text className="text-slate-400 uppercase font-medium">{item.type}</Text>
              </View>

              <View className="flex-row flex-wrap justify-center mt-4">
                {item.genres?.map((g, i) => (
                  <View key={i} className="bg-slate-800 px-3 py-1 rounded-full m-1">
                    <Text className="text-slate-400 text-[10px] font-bold">{g}</Text>
                  </View>
                ))}
              </View>

              <Text className="text-slate-300 mt-6 leading-6 text-center text-sm">
                {item.description || "Đang cập nhật nội dung cho bộ phim này..."}
              </Text>

              {lastPos > 0 && (
                <View className="mt-6 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <Text className="text-white text-center text-xs">
                    Bạn đã xem đến <Text className="text-indigo-400 font-bold">{formatTime(lastPos)}</Text>
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                activeOpacity={0.9}
                className="bg-indigo-600 h-16 rounded-2xl items-center justify-center mt-10 shadow-lg shadow-indigo-500/40"
                onPress={loadSources}
              >
                <Text className="text-white font-black text-lg uppercase tracking-widest">Chọn Nguồn Phát</Text>
              </TouchableOpacity>
            </View>
            
            <View className="h-20" />
          </ScrollView>
        </View>
      </ImageBackground>

      {/* Source Selection BottomSheet */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-slate-900 rounded-t-[40px] p-6 h-3/4 border-t border-white/10">
            <View className="w-12 h-1.5 bg-slate-700 self-center rounded-full mb-6" />
            <Text className="text-white text-2xl font-black mb-6">Nguồn Phim</Text>

            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-slate-400 mt-4 font-bold uppercase tracking-tighter text-xs">Đang quét các Addon...</Text>
              </View>
            ) : (
              <FlatList
                data={streams}
                renderItem={renderStreamItem}
                keyExtractor={(s, i) => i.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                  <View className="mb-4">
                    <Text className="text-indigo-400 text-xs font-black uppercase tracking-widest">Gợi ý tốt nhất</Text>
                  </View>
                )}
              />
            )}
            
            <TouchableOpacity 
              className="mt-4 bg-slate-800 py-4 rounded-2xl items-center"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white font-bold">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DetailScreen;
