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
    ActivityIndicator
} from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-easy-toast'
import images from '../Config/images'
import Global from '../Config/global'


const { width, height } = Dimensions.get('window')


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
            spinnerVisible: false,
        }
    }
    componentDidMount() {
        SplashScreen.hide()
        AsyncStorage.getItem('auth').then((value) => {
            if (value) {
                const auth = JSON.parse(value)
                this.setState({ email: auth.email, password: auth.password }, () => this.handleLogin(true))
            }
        })
    }

    handleLogin = (auto = false) => {
        const { email, password } = this.state

        if (email == "") {
            if (auto) {
                Alert.alert(
                    'User Name field is required!',
                    'Please input your username.',
                    [
                        { text: 'OK', onPress: () => this.emailInput.focus() },
                    ],
                    { cancelable: false }
                )
            } else {
                return
            }
        } else if (password == "") {
            if (auto) {
                Alert.alert(
                    'Password field is required!',
                    'Please input your password.',
                    [
                        { text: 'OK', onPress: () => this.passwordInput.focus() },
                    ],
                    { cancelable: false }
                )
            } else {
                return
            }
        } else {
            this.setState({ spinnerVisible: true })
            try {
                fetch(Global.login_url, {
                    method: "POST",
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    }),
                    body: "user_login=" + email + "&user_pass=" + password
                }).then((response) => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        this.setState({ spinnerVisible: false }, () => {
                            Alert.alert(
                                'Connection Error!',
                                "Can't connect to server. Please retry after some time.",
                                [
                                    { text: 'OK', onPress: () => this.emailInput.focus() },
                                ],
                                { cancelable: false }
                            )
                        })
                    }
                }).then((responseData) => {
                    this.setState({ spinnerVisible: false }, () => {
                        if (responseData.Status == 200) {   // login success 
                            this.refs.toast.show('Login Success!', 500);
                            AsyncStorage.setItem('auth', JSON.stringify({ email: email, password: password }), () => {
                                this.props.navigation.navigate(
                                    'MainScreen',
                                )
                            })
                        } else {
                            Alert.alert(
                                'Login failed!',
                                responseData.Message,
                                [
                                    { text: 'OK', onPress: () => this.emailInput.focus() },
                                ],
                                { cancelable: false }
                            )
                        }
                    })
                })
            } catch (error) {
                this.setState({ spinnerVisible: false }, () => {
                    // Alert.alert(
                    //     'Network Error!',
                    //     "Please check your network connection and try again!",
                    //     [
                    //         { text: 'OK', onPress: () => this.emailInput.focus() },
                    //     ],
                    //     { cancelable: false }
                    // )
                })
            }
        }
    }

    handleLink = (url, title) => {
        this.props.navigation.navigate(
            'WebViewScreeen',
            { url, title },
        )
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
                        <TouchableOpacity activeOpacity={0.9} style={styles.loginFrame} disabled={this.state.spinnerVisible} onPress={() => this.handleLogin(true)}>
                            <Image style={styles.login_button_Image} source={images.login_button_Image} />
                        </TouchableOpacity>
                        <View style={styles.forgotFrame} >
                            <TouchableOpacity activeOpacity={0.9} onPress={() => this.handleLink(global.forgot_url, "Forgot Password")}>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.signUpFrame}>
                            <TouchableOpacity activeOpacity={0.9} onPress={() => this.handleLink(global.register_url, "Register")}>
                                <Text style={styles.signUpText}>Create new account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.visitFrame}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => this.handleLink(global.site_url, "Visit Website")}>
                            <Text style={styles.visitText}>Visit Website</Text>
                        </TouchableOpacity>
                    </View>

                    {this.state.spinnerVisible &&
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


