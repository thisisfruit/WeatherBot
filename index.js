'use strict';

const
    bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    request = require('request');

var app = express();
var port = process.env.PORT || process.env.port || 5000;
app.set('port',port);
app.use(bodyParser.json());

const WEATHER_APP_ID =config.get('weather_app_id');

app.post('/webhook',function(req, res){
    let data = req.body;
    let queryDate = data.queryResult.parameters.date;
    let queryCity = data.queryResult.parameters["geo-city"];
    let propertiesObject = {
        q:queryCity,
        APPID:WEATHER_APP_ID,
        units:"metric"
    };
    request({
        uri:'http://api.openweathermap.org/data/2.5/forecast?',
        json:true,
        qs:propertiesObject
    },function(error, response, body){
        if(!error && response.statusCode ==200){
            for (var i=0;i<body.list.length;i++){
                if (queryDate.slice(0,10) == body.list[i].dt_txt.slice(0,10)){
                    var thisFulfullmentMessages = [];
                    var thisObject={};
                    thisObject.card={};
                    thisObject.card.title=queryCity + " " + queryDate.slice(0,10);
                    thisObject.card.subtitle=body.list[i].weather[0].description;
                    thisObject.card.imageUri='https://openweathermap.org/img/w/'+body.list[i].weather[0].icon+".png";
                    thisObject.card.buttons=[{
                        "text":body.list[i].main.temp,
                        "postback":'https://openweathermap.org/img/w/'+body.list[i].weather[0].icon+".png"
                    }];
                    thisFulfullmentMessages.push(thisObject);
                    var responseObject = {
                        fulfillmentMessages:thisFulfullmentMessages
                    }
                    res.json(responseObject);
                break;}
            }       
    }else{
        console.log("[OpenWeatherMap] failed")
    }
});
});

app.listen(app.get('port'),function(){
    console.log('[app.listen] Node app is running on port', app.get('port'));
})

module.exports = app;