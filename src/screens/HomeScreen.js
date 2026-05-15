import React, { useState, useCallback, memo } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import AddonManager from '../services/AddonManager';
import { debounce } from 'lodash'; 

// Tách riêng RenderItem và dùng memo để tối ưu FlatList (chống re-render)
const MovieItem = memo(({ item, onPress }) => (
  <TouchableOpacity 
    activeOpacity={0.8}
    className="flex-1 m-2"
    onPress={() => onPress(item)}
  >
    <View className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl shadow-black/50 border border-slate-800">
      <Image 
        source={{ uri: item.poster }} 
        className="w-full aspect-[2/3]"
        resizeMode="cover"
      />
      <View className="p-3 bg-slate-900/90">
        <Text className="text-white text-xs font-bold" numberOfLines={1}>{item.name}</Text>
        <View className="flex-row justify-between mt-1">
          <Text className="text-indigo-400 text-[10px] font-bold">{item.year}</Text>
          <Text className="text-slate-500 text-[10px] uppercase">{item.type}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    debounce(async (text) => {
      if (text.length < 3) return;
      setLoading(true);
      const data = await AddonManager.fetchMetadata(text);
      setResults(data);
      setLoading(false);
    }, 500),
    []
  );

  const handleTextChange = (text) => {
    setQuery(text);
    search(text);
  };

  const handlePressItem = useCallback((item) => {
    navigation.navigate('Detail', { item });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <MovieItem item={item} onPress={handlePressItem} />
  ), [handlePressItem]);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-5 py-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-3xl font-black italic">MÈOP<Text className="text-indigo-500">HIM</Text></Text>
          <TouchableOpacity 
            className="w-10 h-10 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-500/50"
            onPress={() => navigation.navigate('Settings')}
          >
            <Text className="text-white font-bold text-lg">⚙️</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar with Glassmorphism Effect */}
        <View className="bg-slate-900/60 rounded-2xl px-4 flex-row items-center border border-white/10 h-14 shadow-2xl">
          <TextInput
            className="flex-1 text-white text-base font-medium"
            placeholder="Tìm phim, anime, series..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={handleTextChange}
          />
          {loading ? (
            <ActivityIndicator color="#6366f1" />
          ) : (
            <Text className="text-slate-500 text-xl">🔍</Text>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        // Lazy Loading & Performance Optimization props
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android' || Platform.OS === 'ios'}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          !loading && query.length > 2 ? (
            <View className="items-center mt-20">
              <Text className="text-slate-500 text-lg">Không tìm thấy kết quả phù hợp</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
