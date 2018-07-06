import React, { Component } from 'react'
import { View, } from 'react-native'

import { createStackNavigator, } from 'react-navigation'
import LoginScreen from './Components/LoginScreen'
import WebViewScreeen from './Components/WebViewScreeen'
import MainScreen from './Components/MainScreen'

const RootStack = createStackNavigator(
  {
    // Home: { screen: HomeScreen },
    // Profile: { screen: ProfileScreen },
    Login: LoginScreen,
    WebViewScreeen: WebViewScreeen,
    MainScreen: MainScreen,
  },
  {
    // initialRouteName: 'Login',
    initialRouteName: 'MainScreen',
  }
)

export default class App extends React.Component {
  render() {
    return <RootStack />
  }
}