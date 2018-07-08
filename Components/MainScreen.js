import React, { Component } from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    findNodeHandle,
    View,
    Plat,
    Platform,
    TouchableOpacity,
    Image,
    BackHandler,
    Button,
    Dimensions,
    Alert
} from 'react-native'
import {
    BarcodePicker,
    ScanditModule,
    ScanSession,
    Barcode,
    SymbologySettings,
    ScanSettings,
    ScanOverlay
} from 'scandit-react-native'

import Orientation from 'react-native-orientation'
import Global from '../Config/global'
import images from '../Config/images'


ScanditModule.setAppKey(Platform.OS === 'ios' ? Global.scandit_key_ios : Global.scandit_key_android)
const { width, height } = Dimensions.get('window')
const contentHeight = height - 120
const frameTop = (contentHeight - width) / 2

export default class MainScreen extends Component {
    static navigationOptions = {
        headerTitle: <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', width: width }}>Capture VIN Number</Text>,
        headerStyle: {
            backgroundColor: '#222222',
        },
        headerRight: Platform.OS === 'ios' ? null :
            (<TouchableOpacity onPress={() => BackHandler.exitApp()} style={{ marginRight: 15, }}  >
                <Image source={images.cross_line_Image} resizeMode={'stretch'} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>),
        headerLeft: null,
    }

    constructor(props) {
        super(props)
        this.timeoutRef = null
        this.state = {
            rectImage: images.rect_port_Image,
            orientation: '',
            captured: false,
        }
    }

    componentWillMount() {
        const orientation = Orientation.getInitialOrientation()
        this.updateOrientation(orientation)
        this.barcodeSetting()
        console.log("componentWillMount")
    }
    componentDidMount() {
        Orientation.addSensorBaseOrientationListener(this._sensorBaseOrientationChange)
        Orientation.addSpecificOrientationListener(this._specificOrientationChange)
        BackHandler.addEventListener('hardwareBackPress', function () {
            BackHandler.exitApp()
        })
        this.scanner.setGuiStyle(ScanOverlay.GuiStyle.NONE)
        this.scanner.setBeepEnabled(true)
        this.scanner.startScanning()
        this.startScanning()
        this.subs = [
            // this.props.navigation.addListener('willFocus', () => console.log('will focus')),
            // this.props.navigation.addListener('willBlur', () => console.log('will blur')),
            this.props.navigation.addListener('didFocus', () => this.startScanning()),
            this.props.navigation.addListener('willBlur', () => {
                this.timeoutRef = null
                this.scanner.pauseScanning()
            }),
        ];
    }
    componentWillUnmount() {
        Orientation.removeOrientationListener(this._sensorBaseOrientationChange)
        Orientation.removeSpecificOrientationListener(this._specificOrientationChange)
        this.timeoutRef = null
        this.scanner.stopScanning()
    }
    _sensorBaseOrientationChange = (orientation) => {
        this.updateOrientation(orientation)
    }
    _specificOrientationChange = (orientation) => {
        this.updateOrientation(orientation)
    }
    updateOrientation = (orientation) => {
        switch (orientation) {
            case 'PORTRAIT':
                this.setState({ rectImage: images.rect_port_Image, orientation })
                break
            case 'LANDSCAPE-RIGHT':
                this.setState({ rectImage: images.rect_right_Image, orientation })
                break
            case 'PORTRAITUPSIDEDOWN':
                this.setState({ rectImage: images.rect_updown_Image, orientation })
                break
            case 'LANDSCAPE-LEFT':
                this.setState({ rectImage: images.rect_left_Image, orientation })
                break
            default:
                this.setState({ rectImage: images.rect_port_Image, orientation })
                break
        }
    }


    startScanning = () => {
        if (this.timeoutRef) {
            clearTimeout(this.timeoutRef)
            this.scanner.resumeScanning()
        } else {
            if (this.scanner) this.scanner.startScanning()
        }
        this.timeoutRef = setTimeout(() => this.pauseScanning(), 10000)
    }
    pauseScanning(session = null) {
        if (this.timeoutRef) {
            clearTimeout(this.timeoutRef)
        }
        if (this.scanner) this.scanner.pauseScanning()
        if (session) {            // if scaned code            
            let vin_number = session.newlyRecognizedCodes[0].data
            if (vin_number.length > 17) {
                if (vin_number.charAt(0) == 'I') {
                    vin_number = vin_number.substring(1, 18);
                } else {
                    vin_number = vin_number.substring(0, 17);
                }
            }
            Alert.alert(
                'Captured!',
                "Result: " + vin_number + "\n\n Please select search button for more information.",
                [
                    { text: 'SEARCH', onPress: () => this.gotoSearch(vin_number) },
                    { text: 'RETRY', onPress: () => this.startScanning() },
                ],
                { cancelable: false }
            )
        } else {                  //  if timeout
            Alert.alert(
                'VIN scan timed out!',
                'VIN Number was not scaned for 15s. You can enter number manually.',
                [
                    { text: 'RETRY', onPress: () => this.startScanning() },
                    { text: 'ENTER VIN MANUALLY', onPress: () => this.gotoManually() },
                ],
                { cancelable: false }
            )
        }

    }


    gotoManually = () => {
        const url = Global.manually_url
        this.props.navigation.navigate('WebViewScreeen', { url }, )
    }
    gotoSearch = (code) => {
        this.props.navigation.navigate('ResultScreen', { code }, )
    }

    barcodeSetting = () => {
        const codeTypes = [
            Barcode.Symbology.EAN13, Barcode.Symbology.EAN8, Barcode.Symbology.UPCA, Barcode.Symbology.UPCE, Barcode.Symbology.CODE39,
            Barcode.Symbology.ITF, Barcode.Symbology.QR, Barcode.Symbology.DATA_MATRIX, Barcode.Symbology.DATA_MATRIX, Barcode.Symbology.CODE128,
        ]
        this.settings = new ScanSettings()
        codeTypes.forEach(type => {
            this.settings.setSymbologyEnabled(type, true)
        })
        this.settings.getSymbologySettings(Barcode.Symbology.CODE39).activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    }


    render() {
        console.log("this.state.rectImage== ", this.state.rectImage)
        return (
            <View style={styles.contentView}>
                <BarcodePicker
                    onScan={(session) => { this.pauseScanning(session) }}
                    scanSettings={this.settings}
                    ref={(scan) => { this.scanner = scan }}
                    style={{ flex: 1, }} />
                <Image source={this.state.rectImage} style={styles.rectImage} resizeMode={'stretch'} />
            </View>

        )
    }


}

const styles = StyleSheet.create({
    contentView: {
        flex: 1,
        flexDirection: 'column'
    },
    rectImage: {
        position: 'absolute',
        top: frameTop,
        width: width,
        height: width,
    },
})