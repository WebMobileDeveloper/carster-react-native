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
    Alert,
    ScrollView
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
import images from '../Config/images'


const { width, height } = Dimensions.get('window')
const contentHeight = height - 120
const frameTop = (contentHeight - width) / 2

export default class ResultScreen extends Component {
    static navigationOptions = {
        headerTitle: <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', width: width - 90 }}>SEARCH RESULT</Text>,
        headerStyle: {
            backgroundColor: '#222222',
        },
        headerTintColor: 'white'
    }

    constructor(props) {
        super(props)
        this.state = {
            code: '2D4RN4DE6AR353648',               //this.props.navigation.state.params.code   
            loading: true,
            search_data: {
                driven_wheels: "FWD",
                gross_weight: "5700",
                curb_weight: "4321",
                fuel_type: "G",
                engine_name: "3.3L V6 175hp 205ft. lbs.",
                vehicle_length: "202.5",
                vehicle_height: "68.9",
                vehicle_width: "88.5",
                vehicle_style: "SE Canada Value Package 4dr Mini-Van",
                vehicle_type: "Van",
                year: "2010",
                make: "Dodge",
                model: "Grand Caravan",
                trim: "SE Canada Value Package",
                made_in: "Canada"
            },
            result: {
                "status": "200",

                "alerts": {
                    "low_oil_pan_images": {
                        "image_0": "https://mycarster.com/wp-content/themes/twentyseventeen/assets/webcarster/images/alertImages/oil-pan-warning-diagram.png"
                    },
                    "hook_up_images": [

                    ],
                    "bumber_images": {
                        "image_0": "https://mycarster.com/wp-content/themes/twentyseventeen/assets/webcarster/images/alertImages/bumper-and-subframe-diagram.png",
                        "image_1": "https://mycarster.com/wp-content/themes/twentyseventeen/assets/webcarster/images/alertImages/back-bumper-and-subframe-diagram.png"
                    },
                    "hookup_alert": "FRONT / REAR HOOK. DOLLIES REQUIRED ON REAR HOOK",
                    "oilpan_alert": "Low oil pan, use an approved method of protection.",
                    "bumper_alert": "Warning! Maintain clearance between wheel lift, bumper and sub-frame."
                }
            }
        }
    }

    componentWillMount() {
    }
    // componentDidMount() {
    //     this.setState({loading: true})
    //     try {
    //         fetch(Global.search_url, {
    //             method: "POST",
    //             headers: new Headers({
    //                 'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
    //             }),
    //             body: "vin=" + this.state.code
    //         }).then((response) => {
    //             if (response.ok) {
    //                 return response.json()
    //             } else {
    //                 this.setState({ loading: false }, () => {
    //                     Alert.alert(
    //                         'Connection Error!',
    //                         "Can't connect to server. Please retry after some time.",
    //                         [
    //                             { text: 'OK', onPress: () => {} },
    //                         ],
    //                         { cancelable: false }
    //                     )
    //                 })
    //             }
    //         }).then((responseData) => {
    //             this.setState({ loading: false }, () => {
    //                 if (responseData.Status == 200) {   // login success 

    //                     Alert.alert(
    //                         'Success!',
    //                         JSON.stringify(responseData),
    //                         [
    //                             { text: 'OK', onPress: () => {} },
    //                         ],
    //                         { cancelable: false }
    //                     )
    //                     console.log("JSON.stringify(responseData)======",JSON.stringify(responseData))


    //                 } else {
    //                     Alert.alert(
    //                         'Wrong Data!',
    //                         JSON.stringify(responseData),
    //                         [
    //                             { text: 'OK', onPress: () => {} },
    //                         ],
    //                         { cancelable: false }
    //                     )
    //                 }
    //             })
    //         })
    //     } catch (error) {
    //         this.setState({ spinnerVisible: false }, () => {
    //             // Alert.alert(
    //             //     'Network Error!',
    //             //     "Please check your network connection and try again!",
    //             //     [
    //             //         { text: 'OK', onPress: () => this.emailInput.focus() },
    //             //     ],
    //             //     { cancelable: false }
    //             // )
    //         })
    //     }
    // }
    componentWillUnmount() {
    }

    gotoManually = () => {
        const url = Global.manually_url
        this.props.navigation.navigate(
            'WebViewScreeen',
            { url },
        )
    }

    _renderItem = () => {
        const items = { ...this.state.search_data }
        const keys = Object.keys(items);
        let index = 0

        return keys.map((key) => {
            const title = key.replace("_", " ").toUpperCase()
            const backgroundColor = { backgroundColor: (index % 2 == 0) ? "#D7D7D7" : "#DFF1D9" }
            index++
            return (
                <View style={[scrollStyle.item, backgroundColor]} key={key} >
                    <Text style={scrollStyle.itemTitleText}>{title}</Text>
                    <Text style={scrollStyle.itemContentText}>{items[key]}</Text>
                </View >
            )
        })

    }

    render() {
        return (
            <View style={styles.contentView}>
                <View style={styles.headerView}>
                    <Image style={styles.top_backImage} source={images.top_back_Image} resizeMode={'stretch'} />
                    <Image style={styles.resultsImage} source={images.results_Image} resizeMode={'stretch'} />
                    <View style={styles.textFrame}>
                        <Text style={styles.topText}>VIN NUMBER:</Text>
                        <Text style={styles.topText}>{this.state.code}</Text>
                    </View>

                </View>
                <View style={styles.bottomView}>
                    <ScrollView style={styles.scrollView}>
                        {this._renderItem()}
                        <View style={scrollStyle.cautionYellow}>
                            <Text style={scrollStyle.cautionTitleYellow}>caution!</Text>
                            <Text style={scrollStyle.cautionContentYellow}>Please be advised alerts do not represent modified vehicles.</Text>
                        </View>
                    </ScrollView>
                </View>
            </View>

        )
    }
}

const styles = StyleSheet.create({
    contentView: {
        flexDirection: 'column'
    },
    headerView: {
        width: width,
        height: 70,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    top_backImage: {
        position: 'absolute',
        width: width,
        height: 70,
    },
    resultsImage: {
        width: 60,
        height: 60,
        marginVertical: 5,
        marginLeft: 16,
    },
    textFrame: {
        width: width - 86,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topText: {
        fontWeight: 'bold'
    },
    bottomView: {
        width: width,
        height: height - 134,
        padding: 8,
    },
    scrollView: {
        width: width - 16,
    }
})
const scrollwidth = width - 16
const scrollStyle = StyleSheet.create({
    // items
    item: {
        width: scrollwidth,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemTitleText: {
        width: scrollwidth * 0.4,
        fontWeight: 'bold',
        padding: 8,
    },
    itemContentText: {
        width: scrollwidth * 0.6,
        fontWeight: 'bold',
        padding: 8,
    },
    // cautionYellow
    cautionYellow: {
        width: scrollwidth,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 20,
        backgroundColor: "#FEDA7C",
    },
    cautionTitleYellow: {
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: 'bold'
    },
    cautionContentYellow: {
        paddingRight: 16,
        fontSize: 14,
    },
})
