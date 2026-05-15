import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '../store';
import RNFS from 'react-native-fs';

const SettingsScreen = ({ navigation }) => {
  const history = useStore(state => state.history);

  const handleClearCache = async () => {
    try {
      const cachePath = `${RNFS.CachesDirectoryPath}/meophim_vcache`;
      const exists = await RNFS.exists(cachePath);
      if (exists) {
        await RNFS.unlink(cachePath);
      }
      Alert.alert('Thành công', 'Đã dọn dẹp bộ nhớ đệm (Cache) giải phóng RAM.');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể xóa cache: ' + e.message);
    }
  };

  const handleClearHistory = () => {
    useStore.setState({ history: [], playbackPositions: {} });
    Alert.alert('Đã xóa', 'Đã làm trống lịch sử xem và tiến trình.');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-5 py-4 flex-row items-center border-b border-white/10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 justify-center">
          <Text className="text-white text-2xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-black italic">CÀI ĐẶT</Text>
      </View>

      <View className="p-5">
        <View className="bg-slate-900 rounded-3xl p-5 mb-6 border border-white/5 shadow-2xl">
          <Text className="text-indigo-400 font-black mb-5 uppercase tracking-widest text-xs">Quản lý Dữ liệu & RAM</Text>
          
          <TouchableOpacity onPress={handleClearCache} className="flex-row justify-between items-center py-4 border-b border-white/5">
            <View>
              <Text className="text-white font-bold text-base">Xóa Cache Torrent</Text>
              <Text className="text-slate-400 text-xs mt-1">Giải phóng bộ nhớ iPhone</Text>
            </View>
            <Text className="text-indigo-500 text-xl">🗑️</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClearHistory} className="flex-row justify-between items-center py-4">
            <View>
              <Text className="text-white font-bold text-base">Xóa Lịch Sử ({history.length})</Text>
              <Text className="text-slate-400 text-xs mt-1">Xóa lịch sử và tiến trình phim</Text>
            </View>
            <Text className="text-red-500 text-xl">❌</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-slate-900 rounded-3xl p-5 border border-white/5 shadow-2xl">
          <Text className="text-indigo-400 font-black mb-4 uppercase tracking-widest text-xs">Thông tin Ứng dụng</Text>
          <View className="flex-row justify-between py-2 border-b border-white/5">
            <Text className="text-white font-medium">Phiên bản</Text>
            <Text className="text-slate-400 font-mono">1.0.0 (TrollStore)</Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-white/5">
            <Text className="text-white font-medium">Engine</Text>
            <Text className="text-slate-400 font-mono">WebTorrent</Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-white font-medium">Network Limit</Text>
            <Text className="text-slate-400 font-mono">50 Conns</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
