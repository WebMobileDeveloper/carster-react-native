import React, { Component } from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    findNodeHandle,
    View,
    Plat,
    Platform,
    TouchableOpacity
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
import Global from '../Config/global'

ScanditModule.setAppKey(Platform.OS === 'ios' ? Global.scandit_key_ios : Global.scandit_key_android)

export default class MainScreen extends Component {


    constructor(props) {
        super(props)
        this.overlayStyles = [
            ScanOverlay.GuiStyle.DEFAULT,
            ScanOverlay.GuiStyle.LASER,
            ScanOverlay.GuiStyle.LOCATIONS_ONLY,
            ScanOverlay.GuiStyle.LOCATIONSONLY,
            ScanOverlay.GuiStyle.NONE,
        ]
        this.CameraSwitchVisibility = [
            ScanOverlay.CameraSwitchVisibility.NEVER,
            ScanOverlay.CameraSwitchVisibility.ALWAYS,
            ScanOverlay.CameraSwitchVisibility.ON_TABLET,
        ]
        this.state = {
            overlayStyle: '',
            styleNumber: 0,
            cameraVisibility: 0,
            password: '',
            spinnerVisible: false,
        }
    }
    componentWillMount() {
        this.barcodeSetting()
    }

    componentDidMount() {
        this.scanner.setGuiStyle(ScanOverlay.GuiStyle.NONE);
        // this.scanner.setCameraSwitchVisibility(ScanOverlay.CameraSwitchVisibility.NEVER);
        this.scanner.startScanning()
    }

    barcodeSetting = () => {

        const codeTypes = [
            Barcode.Symbology.EAN13,
            Barcode.Symbology.EAN8,
            Barcode.Symbology.UPCA,
            Barcode.Symbology.UPCE,
            Barcode.Symbology.CODE39,
            Barcode.Symbology.ITF,
            Barcode.Symbology.QR,
            Barcode.Symbology.DATA_MATRIX,
            Barcode.Symbology.DATA_MATRIX,
            Barcode.Symbology.CODE128,
        ]
        this.settings = new ScanSettings()
        codeTypes.forEach(type => {
            this.settings.setSymbologyEnabled(type, true)
        })

        /* Some 1d barcode symbologies allow you to encode variable-length data. By default, the
           Scandit BarcodeScanner SDK only scans barcodes in a certain length range. If your
           application requires scanning of one of these symbologies, and the length is falling
           outside the default range, you may need to adjust the "active symbol counts" for this
           symbology. This is shown in the following few lines of code. */
        this.settings.getSymbologySettings(Barcode.Symbology.CODE39)
            .activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        /* For details on defaults and how to calculate the symbol counts for each symbology, take
           a look at http://docs.scandit.com/stable/c_api/symbologies.html. */
    }
    handleChangeStyle = () => {
        let styleNumber = (this.state.styleNumber + 1) % 5
        let cameraVisibility = (this.state.cameraVisibility + 1) % 3
        this.scanner.setGuiStyle(this.overlayStyles[styleNumber]);
        this.scanner.setCameraSwitchVisibility(this.CameraSwitchVisibility[cameraVisibility]);
        this.setState({ styleNumber, cameraVisibility })
        this.setState({ styleNumber })
    }
    render() {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'column'
            }}>
                <BarcodePicker
                    onScan={(session) => { this.onScan(session) }}
                    scanSettings={this.settings}
                    ref={(scan) => { this.scanner = scan }}
                    style={{ flex: 10 }} />
                {/* <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }} onPress={this.handleChangeStyle}>
                    <Text style={{ color: 'black' }}>change Style</Text>
                    <Text>{'overlayStyle : ' + this.overlayStyles[this.state.styleNumber]}</Text>
                    <Text>{'CameraSwitchVisibility : ' + this.CameraSwitchVisibility[this.state.cameraVisibility]}</Text>
                </TouchableOpacity> */}
            </View>
        )
    }

    onScan(session) {
        alert(session.newlyRecognizedCodes[0].data + " " + session.newlyRecognizedCodes[0].symbology)
    }

}
