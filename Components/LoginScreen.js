import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    TouchableOpacity,
    Dimensions,
    AsyncStorage,
    ImageBackground,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-easy-toast'
import images from '../Config/images'
import Global from '../Config/global'
import ApiUtils from './ApiUtils'
import DeviceInfo from 'react-native-device-info'
const { width, height } = Dimensions.get('window')
const dev_id = DeviceInfo.getDeviceId();
const dev_type = (Platform.OS === 'ios' ? 'iOS' : 'Android');
export default class LoginScreen extends Component {
    static navigationOptions = {
        title: 'Login',
        header: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            loading: false,
        }
    }
    componentDidMount() {
        // SplashScreen.hide()
        AsyncStorage.getItem('auth').then((value) => {
            if (value) {
                const auth = JSON.parse(value)
                this.setState({ email: auth.email, password: auth.password }, () => this.handleLogin())
            }
        })
    }

    checkAuth = () => {
        const { email, password } = this.state
        if (email == "") {
            Alert.alert(
                'User Name is required!',
                'Please input your email.',
                [
                    { text: 'OK', onPress: () => this.emailInput.focus() },
                ],
                { cancelable: false }
            )
        } else if (password == "") {
            Alert.alert(
                'Password is required!',
                'Please input your password.',
                [
                    { text: 'OK', onPress: () => this.passwordInput.focus() },
                ],
                { cancelable: false }
            )
        } else {
            this.handleLogin()
        }
    }

    handleLogin = () => {
        const _self = this
        const { email, password } = this.state
        this.setState({ loading: true })

        fetch(Global.login_url,
            {
                method: "POST",
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                }),
                body: "user_login=" + email + "&user_pass=" + password + "&dev_id=" + dev_id + "&dev_type=" + dev_type
            })
            .then(ApiUtils.checkStatus)
            .then((response) => { return response.json() })
            .then((responseData) => {
                _self.setState({ loading: false })
                if (responseData === [] || responseData.length === 0) {
                    Alert.alert(
                        'Connection Error!',
                        "Couldn't connect to server. Please retry after a moment",
                        [
                            { text: 'OK', onPress: () => _self.emailInput.focus() },
                        ],
                        { cancelable: false }
                    )
                } else {
                    if (responseData.Status == 200) {   // login success 
                        _self.refs.toast.show('Login Success!', 500)
                        AsyncStorage.setItem('auth', JSON.stringify({ email: email, password: password }), () => {
                            _self.props.navigation.navigate(
                                'MainScreen',
                            )
                        })
                    } else {
                        Alert.alert(
                            'Login failed!',
                            responseData.Message,
                            [
                                { text: 'OK', onPress: () => _self.emailInput.focus() },
                            ],
                            { cancelable: false }
                        )
                    }
                }
            })
            .catch(function (error) {
                _self.setState({ loading: false })
                Alert.alert(
                    'Network Error!',
                    "Please check your network connection and try again!",
                    [
                        { text: 'OK', onPress: () => _self.emailInput.focus() },
                    ],
                    { cancelable: false }
                )
            })
            .done()
    }

    handleLink = (url, title) => {
        this.props.navigation.navigate(
            'WebViewScreeen',
            { url, title },
        )
    }
    registerFrame = () => {
        return Platform.OS === 'android' ?
            <View style={styles.signUpFrame}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => this.handleLink(Global.register_url, "Register")}>
                    <Text style={styles.signUpText}>Create new account</Text>
                </TouchableOpacity>
            </View> : <View style={styles.signUpFrame}></View>
    }
    visitFrame = () => {
        return Platform.OS === 'android' ?
            <View style={styles.visitFrame}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => this.handleLink(Global.site_url, "Visit Website")}>
                    <Text style={styles.visitText}>Visit Website</Text>
                </TouchableOpacity>
            </View> : <View style={styles.visitFrame}></View>
    }
    render() {
        return (
            <ImageBackground resizeMode={'stretch'} style={styles.background} source={images.login_back_Image}  >
                <KeyboardAwareScrollView scrollEnabled={true} resetScrollToCoords={{ x: 0, y: 0 }}
                    showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentView} >

                    <Image source={images.logo_Image} resizeMode={'stretch'} style={styles.logoImage} />

                    <View style={styles.contentFrame}>
                        <View style={styles.textInputFrame} >
                            <Image source={images.email_gray_Image} style={styles.textImage} resizeMode={'stretch'} />
                            <TextInput keyboardType='email-address'
                                ref={(input) => { this.emailInput = input }}
                                onChangeText={(text) => this.setState({ email: text })}
                                placeholder='User Name'
                                autoCapitalize='none'
                                placeholderTextColor='rgba(255, 255, 255, 0.5)'
                                value={this.state.email}
                                underlineColorAndroid='transparent'
                                selectionColor={'black'}
                                onSubmitEditing={() => this.passwordInput.focus()}
                                returnKeyType='next'
                                style={styles.textInput} />
                        </View>
                        <View style={[styles.textInputFrame, { marginTop: 16 }]}>
                            <Image source={images.password_gray_Image} style={styles.textImage} resizeMode={'stretch'} />
                            <TextInput secureTextEntry
                                ref={(input) => { this.passwordInput = input }}
                                autoCapitalize='none'
                                onChangeText={(text) => this.setState({ password: text })}
                                placeholder='Password'
                                placeholderTextColor='rgba(255, 255, 255, 0.5)'
                                value={this.state.password}
                                underlineColorAndroid='transparent'
                                selectionColor={'black'}
                                returnKeyType='done'
                                style={styles.textInput} />
                        </View>
                        <TouchableOpacity activeOpacity={0.9} style={styles.loginFrame} disabled={this.state.loading} onPress={() => this.checkAuth()}>
                            <Image style={styles.login_button_Image} source={images.login_button_Image} />
                        </TouchableOpacity>
                        <View style={styles.forgotFrame} >
                            <TouchableOpacity activeOpacity={0.9} onPress={() => this.handleLink(Global.forgot_url, "Forgot Password")}>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                        {this.registerFrame()}

                    </View>
                    {this.visitFrame()}
                    {this.state.loading &&
                        <View style={styles.loading}>
                            <ActivityIndicator size='large' />
                        </View>
                    }

                    <Toast ref="toast" />

                </KeyboardAwareScrollView>
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    contentView: {
        flex: 1,
        width: width,
        height: height,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    background: {
        flex: 1,
        width: width,
        height: height
    },
    logoImage: {
        marginTop: height * 0.1,
        width: width * 0.21,
        height: height * 0.13
    },


    //====== content===========

    contentFrame: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    textInputFrame: {
        width: width * 0.7,
        height: 35,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderColor: 'white',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        backgroundColor: 'rgba(100,100,100,0.1)',
    },
    textImage: {
        width: 30,
        height: 26,
    },
    textInput: {
        width: width * 0.7 - 46,
        textAlign: 'left',
        color: '#555555',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        paddingBottom: 3,
    },
    loginFrame: {
        marginTop: 20,
    },
    login_button_Image: {
        width: width / 3,
        height: width / 9,
    },



    // forgot
    forgotFrame: {
        marginTop: 30,
        // ...Platform.select({
        //     android: {
        //         display: 'none',
        //     },
        // }),
    },
    forgotText: {
        color: 'rgb(10,80,206)',
        fontWeight: '500',
    },


    // signup
    signUpFrame: {
        marginTop: 30,
        // ...Platform.select({
        //     android: {
        //         display: 'none',
        //     },
        // }),
    },
    signUpText: {
        color: 'rgb(10,80,206)',
        fontWeight: '500',
        fontSize: 18,
    },


    // visit
    visitFrame: {
        paddingBottom: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

        // ...Platform.select({
        //     android: {
        //         display: 'none',
        //     },
        // }),
    },
    visitText: {
        color: 'rgb(80,80,80)',
        fontWeight: '500',

    },
    // loading
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
})


