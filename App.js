import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Import các màn hình đã tạo
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import PlayerScreen from './src/screens/PlayerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* Cấu hình thanh trạng thái cho Dark Mode */}
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // Ẩn header mặc định vì ta đã tự build UI header riêng
          contentStyle: { backgroundColor: '#020617' }, // Màu nền slate-950
          animation: 'slide_from_right' // Hiệu ứng chuyển cảnh mượt mà
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen} 
        />
        <Stack.Screen 
          name="Player" 
          component={PlayerScreen} 
          options={{
            animation: 'fade', // Chuyển sang màn hình player dùng hiệu ứng fade
            presentation: 'fullScreenModal' // Hiển thị full màn hình
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
