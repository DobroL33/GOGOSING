import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,ImageBackground } from 'react-native';

import store from './store/store'
import { Provider } from 'react-redux';
// BottomBar 관련
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MainHome from './src/pages/mainhome';
import MusicChart from './src/pages/musicchart';
import MusicSearch from './src/pages/musicsearch';
import MusicLike from './src/pages/musiclike';

import Topbar from './src/components/Topbar';
import BottomBar from './src/components/Bottombar'; // 하단 바 컴포넌트 임포트

// import MusicChart from './pages/musicchart';
// import MusicSearch from './pages/musicsearch';
// import MusicLike from './pages/musiclike';

// import SignUp from './pages/account/signup';
// import Login from './pages/account/login';
// import LocalLogin from './pages/account/locallogin';

// import MusicRecord from './pages/musicrecord';
// import MusicUpload from './pages/musicupload';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent', // 배경을 투명하게 설정
  },
};

const App:React.FC = () => {
  return (
    <Provider store={store}>
      <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}>
        <NavigationContainer theme={MyTheme}>
          {/* <Stack.Navigator>
            <Stack.Screen name='login' component={Login} />
          </Stack.Navigator> */}
          <View style={styles.topbar}>
            <Topbar />
          </View>
          <View style={styles.container}>
            <Tab.Navigator tabBar={(props) => <BottomBar {...props} />} >
              <Tab.Screen name="home" component={MainHome} options={{tabBarLabel:'홈', headerShown:false}}/>
              <Tab.Screen name="chart" component={MusicChart} options={{tabBarLabel:'차트', headerShown:false}} />
              <Tab.Screen name="search" component={MusicSearch} options={{tabBarLabel:'검색', headerShown:false}}/>
              <Tab.Screen name="like" component={MusicLike} options={{tabBarLabel:'보관함', headerShown:false}}/>
            </Tab.Navigator>
          </View>

        </NavigationContainer>
      </ImageBackground>
    </Provider>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1, // 화면 전체를 차지하도록 합니다.
    resizeMode: 'cover', // 이미지 크기 조절 옵션 (다른 옵션도 가능)
  },
  topbar :{
    flex:0.2,
    width:'100%',
  },
  container: {
    flex: 1, // 이 부분이 화면 전체 영역을 차지하도록 하는 핵심입니다.
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default App;
