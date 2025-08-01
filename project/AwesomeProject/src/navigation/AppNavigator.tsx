import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 导入页面组件
import Login from '../pages/Login/Login';
import Shou from '../pages/Shou/Shou';
import Drug from '../pages/Drug/Drug';
import Cart from '../pages/Cart/Cart';
import Mine from '../pages/Mine/Mine';
import AiConsult from '../pages/AiConsult/AiConsult';
import ArticleDetail from '../pages/Detail/ArticleDetail';
import LineLiao from '../pages/LineLiao/LineLiao';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 底部标签导航器
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Shou} 
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Drug" 
        component={Drug} 
        options={{
          tabBarLabel: '药品',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💊</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={Cart} 
        options={{
          tabBarLabel: '购物车',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🛒</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Mine" 
        component={Mine} 
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 主应用导航器
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
        <Stack.Screen name="AiConsult" component={AiConsult} />
        <Stack.Screen name="ArticleDetail" component={ArticleDetail} />
        <Stack.Screen name="LineLiao" component={LineLiao} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 