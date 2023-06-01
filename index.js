const express = require('express');
const bodyParser = require('body-parser');
const axios = require("axios");
const Process = require("process");
require('dotenv').config();

const app = express().use(bodyParser.json()); // creates http server

const whatsApp_Token=process.env.WHATSAPP_TOKEN; //for the sending request
const AppToken=process.env.APP_TOKEN; //verfiy webhook

app.listen(8000 || process.env.PORT, () => {
    console.log('Webhook server is listening, port 8000')
});

//to verify the callback url from Meta side - cloud API side
app.get('/webhook', (req, res) => {
    // creates endpoint for webhook
    console.log(req); // display request object in console
    let modeOnReq= req.query['hub.mode'];
    let challengeOnReq= req.query['hub.challenge'];
    let tokenOnReq= req.query['hub.verify_token'];



    if(modeOnReq && tokenOnReq){
        if(modeOnReq === 'subscribe' && tokenOnReq === AppToken){
            console.log('Webhook verified');
            res.status(200).send(challengeOnReq);
        }else{
            res.sendStatus(403); //forbidden request
        }
    }

});

app.post('/webhook', (req, res) => {

    let bodyParam = req.body;
    console.log(JSON.stringify(bodyParam,null,2));

    if (bodyParam.object){
        if(bodyParam.entry &&
        bodyParam.entry[0].changes &&
        bodyParam.entry[0].changes[0].value.messages &&
        bodyParam.entry[0].changes[0].value.messages[0]){
            let phone_number_id= req.body.entry[0].changes.value.metadata.phone_number_id;
            let from = req.body.entry[0].changes.value.messages[0].from
            let msg_body = req.body.entry[0].changes.value.messages[0].text.body;

            axios({
                method: 'post',
                url: 'https://graph.facebook.com/v16.0'+phone_number_id+'/messages?access_token='+whatsApp_Token,
                data: {
                    "messaging_type": "RESPONSE",
                    to: from,
                    "text": {
                        "body":"Hi im sarah"
                    }
                },
                headers: {
                    'Content-Type': 'application/json'
                }

            })
            res.sendStatus(200);
        }else {
            res.sendStatus(404);
        }


    }
});

app.get('/', (req, res) => {
    res.status(200).send('Hello world, I am a chat bot')
});