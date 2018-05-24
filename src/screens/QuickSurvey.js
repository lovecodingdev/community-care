import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  View, 
  Image,
  FlatList,
  Alert,
} from 'react-native';

import { Container, Content, Button, Icon, Form, Item, Label, Text, Footer, List, ListItem, Body, CheckBox, Card, CardItem, Row, Right, Left, Radio,} from 'native-base';
import {Images, Colors} from '../theme'
import { responsiveWidth, responsiveHeight } from 'react-native-responsive-dimensions';
import { MyText, Loader, ManyChoices } from "../components";
import Utils from "../components/utils";
import API from '../components/Api'

export default class QuickSurvey extends Component {

    constructor(props){
        super(props)
        this.state = {
            loaderVisible: false,
            isCheckedAgreement: false,
            questions: [],
            surveyName: 'Main Survey',
            checked: true,
        }
    }

    async componentDidMount() {
        this.setState({loaderVisible: true})
        const questions = await API.getQuestionsBySurveyName(this.state.surveyName)
        for (var question of questions) {
            question.checkedIndexes=[]
        }
        this.setState({questions, loaderVisible: false})
    }

    goBack() {
        const {goBack} = this.props.navigation
        goBack()
    }

    onSkip() {
        Alert.alert(
            'Are you sure?',
            'Are you sure to skip the survey?',
            [
                {text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'YES', onPress: async () => {
                }},
            ],
            { cancelable: false }
        )
    }

    onFinish(){
        Alert.alert(
            'Are you sure?',
            'Are you sure to finish the survey?',
            [
                {text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'YES', onPress: async () => {
                    this.setState({loaderVisible: true})
                    const response = await API.postSurveyAnswer(this.state.questions)
                    console.log(response)
                    this.setState({loaderVisible: false})                          
                }},
            ],
            { cancelable: false }
        )
    }

    onChangedSurveyAnswers(questionIndex, checkedIndexes){
        var questions = Utils.copy(this.state.questions)
        questions[questionIndex].checkedIndexes = checkedIndexes
        this.setState({questions})
    }

    renderQuestionItem({item, index}) {
        var localePre = 'e'
        var choices = []
        var many = item.qType == 2
        for (let index = 1; index <= 12; index++) {
            var key = `choice${index}${localePre}`
            var value = item[key]
            if (value == '') break
            choices.push(value)
        }
        var checkedIndexes = item.checkedIndexes ? item.checkedIndexes : []

        return (
            <Card>
                <CardItem>
                    <Body>
                        <MyText center style={styles.question}>{item.etitle}</MyText>
                        <View style={styles.question_divider}/>
                        <ManyChoices many={many} questionIndex={index} data={choices} checkedIndexes={checkedIndexes} onChanged={this.onChangedSurveyAnswers.bind(this)}/>
                    </Body>
                </CardItem>
            </Card>
        )
    }
            
    render() {
        return (
        <Container>
            <Loader loading={this.state.loaderVisible}/>
            <Content contentContainerStyle={styles.container}>
                <MyText medium bold center style={styles.surveyTitle}>{this.state.surveyName}</MyText>
                <FlatList
                    data={this.state.questions}
                    renderItem = {this.renderQuestionItem.bind(this)}
                    keyExtractor = {(item, index) => index.toString()}
                />
                <Row style={styles.buttonBar}>
                    <Button bordered danger onPress={this.onSkip.bind(this)}><Text>   Skip   </Text></Button>
                    <Button primary onPress={this.onFinish.bind(this)}><Text>   Finish   </Text></Button>
                </Row>
            </Content>
        </Container>
        );
    }
}
  
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
    },
    surveyTitle: {
        marginVertical: 18,
    },

    form: {
        marginTop: 24,
    },

    checkboxBody: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    buttonBar: {
        padding: 24,
        justifyContent: 'space-between'
    },

    question: {
        width: '100%'
    },

    question_divider: {
        width: '50%',
        height: 0.5,
        marginVertical: 8,
        alignSelf: 'center',
        backgroundColor: Colors.Navy
    }

});
  