import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    Image,
    BackHandler,
    Dimensions,
    Alert
} from 'react-native'
import {
    BarcodePicker,
    ScanditModule,
    Barcode,
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
        // this.timeoutRef = null
        this.state = {
            rectImage: images.rect_port_Image,
            orientation: '',
            captured: false,
        }
    }

    componentWillMount() {
        const orientation = Orientation.getInitialOrientation()
        this.updateOrientation(orientation)
        this.scannerSetting()        //  ======  scanner setting  ==============
    }
    componentDidMount() {

        //=====scanner setting=======
        this.scanner.setGuiStyle(ScanOverlay.GuiStyle.NONE)
        this.scanner.setBeepEnabled(true)

        // ====    register screen active events  ============
        this.subs = [
            this.props.navigation.addListener('didFocus', () => {
                Orientation.addSensorBaseOrientationListener(this._sensorBaseOrientationChange)
                Orientation.addSpecificOrientationListener(this._specificOrientationChange)
                // ====== for android hardware back press  ========
                BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)

                this.startRound()
            }),
            this.props.navigation.addListener('willBlur', () => {
                this.willDisappear()
            }),
        ];
    }
    componentWillUnmount() {
        this.willDisappear()
    }
    willDisappear = () => {
        Orientation.removeOrientationListener(this._sensorBaseOrientationChange)
        Orientation.removeSpecificOrientationListener(this._specificOrientationChange)
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        window.clearTimeout(this.timeoutRef)
        this.scanner.stopScanning()
        this.scanner.switchTorchOn([false])
    }
    handleBackPress = () => {
        BackHandler.exitApp()
        this.goBack(); // works best when the goBack is async
        return true;
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

    startRound = () => {
        this.scanner.startScanning()
        this.timeoutRef = window.setTimeout(() => { this.timeoutHandler(true) }, Global.captureTime)
    }

    timeoutHandler = () => {
        this.scanner.pauseScanning()
        window.clearTimeout(this.timeoutRef)
        Alert.alert(
            'VIN scan timed out!',
            'VIN Number was not scaned for ' + Math.round(Global.captureTime / 1000) + 's. You can enter number manually.',
            [
                { text: 'RETRY', onPress: () => this.startRound() },
                { text: 'ENTER VIN MANUALLY', onPress: () => this.gotoManually() },
            ],
            { cancelable: false }
        )

    }



    captureHandler = (session) => {
        let vin_number = session.newlyRecognizedCodes[0].data
        this.scanner.pauseScanning()
        window.clearTimeout(this.timeoutRef)

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
                { text: 'RETRY', onPress: () => this.startRound() },
            ],
            { cancelable: false }
        )
    }

    gotoManually = () => {
        const url = Global.manually_url
        const title = "Maual Input"
        this.props.navigation.navigate('WebViewScreeen', { url, title }, )
    }
    gotoSearch = (code) => {
        this.props.navigation.navigate('ResultScreen', { code }, )
    }

    scannerSetting = () => {
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
        return (
            <View style={styles.contentView}>
                <BarcodePicker
                    onScan={(session) => { this.captureHandler(session) }}
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