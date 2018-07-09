import React, { Component } from 'react'
import { View, } from 'react-native'

import { createStackNavigator, } from 'react-navigation'
import LoginScreen from './Components/LoginScreen'
import WebViewScreeen from './Components/WebViewScreeen'
import MainScreen from './Components/MainScreen'
import ResultScreen from './Components/ResultScreen'
import Orientation from 'react-native-orientation'


const RootStack = createStackNavigator(
  {
    // Home: { screen: HomeScreen },
    // Profile: { screen: ProfileScreen },
    Login: LoginScreen,
    WebViewScreeen: WebViewScreeen,
    MainScreen: MainScreen,
    ResultScreen: ResultScreen,
  },
  {
    initialRouteName: 'Login',
    // initialRouteName: 'MainScreen',
    // initialRouteName: 'ResultScreen',
  }
)

export default class App extends React.Component {
  render() {
    return <RootStack />
  }
}
Orientation.lockToPortrait()