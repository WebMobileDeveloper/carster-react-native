import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
    ScrollView,
    ActivityIndicator
} from 'react-native'

import ScaledImage from './ScaledImage'
import Global from '../Config/global'
import images from '../Config/images'


const { width, height } = Dimensions.get('window')
const scrollwidth = width - 16

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
            code: this.props.navigation.state.params.code,
            loading: true,
            search_data: {
                driven_wheels: "",
                gross_weight: "",
                curb_weight: "",
                fuel_type: "",
                engine_name: "",
                vehicle_length: "",
                vehicle_height: "",
                vehicle_width: "",
                vehicle_style: "",
                vehicle_type: "",
                year: "",
                make: "",
                model: "",
                trim: "",
                made_in: ""
            },
            alerts: {
                hookup_alert: {
                    content: "",
                    images: []
                },
                oilpan_alert: {
                    content: "",
                    images: []
                },
                bumper_alert: {
                    content: "",
                    images: []
                }
            }
        }
    }

    componentWillMount() {

    }
    componentDidMount() {
        this.setState({ loading: true })
        try {
            fetch(Global.search_url, {
                method: "POST",
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                }),
                body: "vin=" + this.state.code
            }).then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    this.setState({ loading: false }, () => {
                        Alert.alert(
                            'Connection Error!',
                            "Can't connect to server. Please retry after some time.",
                            [
                                { text: 'OK', onPress: () => { } },
                            ],
                            { cancelable: false }
                        )
                    })
                }
            }).then((responseData) => {
                this.setState({ loading: false }, () => {
                    if (responseData.status == 200) {   // login success 
                        console.log("responseData===", responseData)
                        const { search_data, alerts } = responseData
                        this.setState({ search_data, alerts })
                    } else {
                        Alert.alert(
                            'Wrong Data!',
                            JSON.stringify(responseData),
                            [
                                { text: 'OK', onPress: () => { } },
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
    componentWillUnmount() {
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

    _renderAlert = () => {
        const alerts = { ...this.state.alerts }
        const keys = Object.keys(alerts)
        return keys.map((key) => {
            const title = key.replace("_", " ").toUpperCase()
            const content = (alerts[key].content) ? alerts[key].content : "NA"
            const alertImgs = (alerts[key].images) ? alerts[key].images : []
            return (
                <View style={scrollStyle.alertFrame} key={key}>
                    <View style={scrollStyle.alertTitleFrame}>
                        <Image style={scrollStyle.alertImage} source={images.alert_Image} resizeMode={'contain'} />
                        <Text style={scrollStyle.alertTitle}>{title}</Text>
                    </View>
                    <Text style={scrollStyle.alertContent}>{content}</Text>
                    {alertImgs.map((imgUri, index) => (imgUri) ? <ScaledImage uri={imgUri} width={scrollwidth * 0.6} style={{ marginVertical: 8 }} key={index} /> : null)}
                </View>
            )
        })
    }

    gotoWebPageHandler = (url, title) => {
        this.props.navigation.navigate(
            'WebViewScreeen',
            { url, title },
        )
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
                        {/* items */}
                        {this._renderItem()}

                        {/* Cautions */}
                        <View style={scrollStyle.cautionYellow}>
                            <Text style={scrollStyle.cautionTitleYellow}>caution!</Text>
                            <Text style={scrollStyle.cautionContentYellow}>Please be advised alerts do not represent modified vehicles.</Text>
                        </View>
                        <View style={scrollStyle.cautionRed}>
                            <Text style={scrollStyle.cautionTitleRed}>caution!</Text>
                            <Text style={scrollStyle.cautionContentRed}>
                                All dollies mentioned in hook up alerts are 4.80 Dollie setup. Don't tow faster than 50 MPH on smooth roads, slower on rough roads. Pot holes should be approached at a crawl.{'\n\n'} ** If you use 5.70 Dollie setup, don't tow faster than 60 MPH.
                            </Text>
                        </View>

                        {/* space bar */}
                        <View style={{ backgroundColor: '#FEDA7C', height: 3, }}></View>

                        {/* Alerts */}
                        {this._renderAlert()}

                        {/* Inspection Report */}
                        <TouchableOpacity onPress={() => this.gotoWebPageHandler(Global.inspec_url, "Inspection Report")}><Text style={styles.inspectionText}>INSPECTION REPORT</Text></TouchableOpacity>

                        {/* enterprise   */}
                        <View>
                            <Text style={styles.enterpriseTitle}>Enterprise</Text>
                            <Text style={styles.enterpriseContent}>If you have interested in Carster, please contact us. {'\n'}  We are welcome always!</Text>
                            <View>
                                <TouchableOpacity onPress={() => this.gotoWebPageHandler(Global.contact_url, "Contact Us")}>
                                    <Text style={styles.contactUs}>Contact Us</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* visit website */}
                        <View style={styles.visitFrame}>
                            <TouchableOpacity onPress={() => this.gotoWebPageHandler(Global.site_url, "Visit Website")} >
                                <Text style={styles.visitTitle}>Visit Website</Text>
                            </TouchableOpacity >
                            <View style={styles.visitBottomFrame}>
                                <Text style={styles.visitBottomText}>Copyright@2017</Text>
                                <Image style={styles.visitBottomImage} source={images.footer_Image} resizeMode={'stretch'} />
                                <Text style={styles.visitBottomText}>Copyright@2017</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {this.state.loading &&
                    <View style={styles.loading}>
                        <ActivityIndicator size='large' />
                    </View>
                }
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
    },
    inspectionText: {
        width: scrollwidth,
        marginTop: 8,
        paddingVertical: 16,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#FFFFFF",
        backgroundColor: '#6868F4',
    },
    enterpriseTitle: {
        width: scrollwidth,
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 32,
        textAlign: 'center'
    },
    enterpriseContent: {
        width: scrollwidth,
        fontSize: 16,
        paddingTop: 16,
        paddingHorizontal: 16,
        textAlign: 'center'
    },
    contactUs: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingVertical: 16,
        color: "#1143A9",
        textAlign: 'center',
    },
    visitFrame: {
        width: scrollwidth,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    visitTitle: {
        width: scrollwidth,
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
        paddingVertical: 16,
        textAlign: 'center'
    },
    visitBottomFrame: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
    },
    visitBottomImage: {
        width: 50,
        height: 50,
        marginHorizontal: 8,
    },
    visitBottomText: {
        color: 'white',
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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 20,
        backgroundColor: "#FEDA7C",
    },
    cautionTitleYellow: {
        width: 90,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    },
    cautionContentYellow: {
        width: scrollwidth - 90,
        paddingRight: 16,
        fontSize: 14,
    },


    // cautionRed
    cautionRed: {
        width: scrollwidth,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: "#DF4948",
    },
    cautionTitleRed: {
        width: 90,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    cautionContentRed: {
        width: scrollwidth - 90,
        paddingRight: 16,
        fontSize: 14,
        color: '#FFFFFF',
    },


    //alert Frame

    alertFrame: {
        width: scrollwidth,
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginBottom: 1,
        backgroundColor: "#DF4948",
    },
    alertTitleFrame: {
        width: scrollwidth,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertImage: {
        width: 30,
        height: 30,
        marginHorizontal: 20,
    },
    alertTitle: {
        width: scrollwidth - 70,
        paddingRight: 20,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    alertContent: {
        width: scrollwidth,
        paddingHorizontal: 30,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    alertContentImage: {
        maxWidth: scrollwidth,
        height: 100
    }
})
