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
    Switch,
    ImageBackground,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Spinner from 'react-native-loading-spinner-overlay'
import DialogBox from 'react-native-dialogbox'
import Toast, { DURATION } from 'react-native-easy-toast'
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
        // do stuff while splash screen is shown
        // After having done stuff (such as async tasks) hide the splash screen

        SplashScreen.hide()
        AsyncStorage.getItem('auth').then((value) => {
            if (value) {
                const auth = JSON.parse(value)
                this.setState({ email: auth.email, password: auth.password }, () => this.handleLogin(true))
            }
        })
    }

    handleLogin = (auto = false) => {
        console.log("handleLogin===")
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


                            // this.dialogbox.tip({
                            //     content: 'come on!',
                            // });


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
    handleForgot = () => {
        const url = Global.forgot_url
        this.props.navigation.navigate(
            'WebViewScreeen',
            { url },
        )
    }
    handleSignUp = () => {
        const url = Global.register_url
        this.props.navigation.navigate(
            'WebViewScreeen',
            { url },
        )
    }
    handleVisit = () => {
        const url = Global.site_url
        this.props.navigation.navigate(
            'WebViewScreeen',
            { url },
        )
    }

    render() {
        console.log("spinnerVisible", this.state.spinnerVisible)
        return (
            <View style={styles.contentView}>
                <ImageBackground
                    resizeMode={'stretch'} // or cover
                    style={{ flex: 1 }} // must be passed from the parent, the number may vary depending upon your screen size
                    source={images.login_back_Image}  >
                    <View style={styles.logoFrame}><Image source={images.logo_Image} resizeMode={'stretch'} style={styles.logoImage} /></View>

                    {/* <ScrollView> */}
                    <KeyboardAwareScrollView scrollEnabled={true}
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentFrame} >

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
                        <TouchableOpacity activeOpacity={0.9} style={styles.loginFrame} disabled={this.state.spinnerVisible} onPress={this.handleLogin}>
                            <Image style={styles.login_button_Image} source={images.login_button_Image} />
                        </TouchableOpacity>
                        <View style={styles.forgotFrame} >
                            <TouchableOpacity activeOpacity={0.9} onPress={this.handleForgot}>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.signUpFrame}>
                            <TouchableOpacity activeOpacity={0.9} onPress={this.handleSignUp}>
                                <Text style={styles.signUpText}>Create new account</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                    <View style={styles.visitFrame}>
                        <TouchableOpacity activeOpacity={0.9} onPress={this.handleVisit}>
                            <Text style={styles.visitText}>Visit Website</Text>
                        </TouchableOpacity>
                    </View>

                    {/* </ScrollView> */}
                </ImageBackground>
                {/* <Spinner ref={(ref) => this.Spinner = ref} visible={this.state.spinnerVisible} /> */}
                {/* <ActivityIndicator size="large" color="#0000ff" visible={this.state.spinnerVisible}/> */}
                {this.state.spinnerVisible &&
                    <View style={styles.loading}>
                        <ActivityIndicator size='large' />
                    </View>
                }
                {/** dialogbox component */}
                {/* <DialogBox ref={dialogbox => { this.dialogbox = dialogbox }} /> */}
                <Toast ref="toast" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    contentView: {
        flex: 10,
    },
    logoFrame: {
        position: 'absolute',
        top: height * 0.085,
        width: width,
        flexDirection: 'row',
        justifyContent: 'center',

    },
    logoImage: {
        width: width * 0.21,
        height: height * 0.13
    },
    contentFrame: {
        flex: 1,
        paddingTop: height * 0.5 - 100,
        alignItems: 'center',
        paddingBottom: 80,
    },
    textInputFrame: {
        width: width * 0.7,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: 'white',
    },
    textImage: {
        width: 30,
        height: 26,
    },
    textInput: {
        flex: 1,
        textAlign: 'left',
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    loginFrame: {
        marginTop: 30,
    },
    login_button_Image: {
        width: 120,
        height: 40,
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


