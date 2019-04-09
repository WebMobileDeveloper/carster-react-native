import React, { Component } from 'react'
import { WebView, Text, Dimensions } from 'react-native'
const { width, height } = Dimensions.get('window')

export default class WebViewScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerTitle: <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', width: width - 90 }}>{navigation.state.params.title}</Text>,
        headerStyle: {
            backgroundColor: '#222222',
        },
        headerTintColor: 'white'
    })

    render() {
        return (
            <WebView
                source={{ uri: this.props.navigation.state.params.url }}
            />
        )
    }
}
