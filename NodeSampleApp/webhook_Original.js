const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const hostname = '207.138.132.95';
const port = 54781;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var PNRrequestStructure= {
  host: '207.138.132.95',  
  port : 13035,
  path : '/import/imperialcoders/retrieveCustomerInfo/pnr/QWEKRL',
  method: 'GET'
  }



var contexts = [];


const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          getWatson(event);
        }
      });
    });
    res.status(200).end();
  }
});
const request = require('request');

function getJSON(options,cb)
{

var externalRes='';

http.request(requestStructure, function(res){
  var body='';
  
  res.on('data', function(chunk){
  body+=chunk;
  });
  
  res.on('end',function()
  {
   var endResult=JSON.parse(body);
   //externalRes=endResult;
   cb(null,endResult);
   
  });
  
  res.on('error',cb);
  }).on('error',cb)
  .end();
}


function getWatson(event)
{
var number=event.sender.id;
var message=event.message.text;
var context = null;
  var index = 0;
  var contextIndex = 0;
  contexts.forEach(function(value) {
    console.log(value.from);
    if (value.from == number) {
      context = value.context;
      contextIndex = index;
    }
    index = index + 1;
  });
console.log('Recieved message from ' + number + ' saying \'' + message  + '\'');
var conversation = new ConversationV1({
    username: 'b97b3531-2942-48bc-ae24-352dfad7095d',
    password: '4CXA3trEctj3',
    version_date: ConversationV1.VERSION_DATE_2016_09_20
  });  
  console.log(JSON.stringify(context));
  console.log(contexts.length);
  

  conversation.message({
    input: { text: message },
    workspace_id: 'bda5e1bc-0464-4e9a-ad1a-8b7c5af14692',
    context: context
   }, function(err, response) {
       if (err) {
         console.error(err);
       } else {
         console.log(response.output.text[0]);
         if (context == null) {
           contexts.push({'from': number, 'context': response.context});
         } else {
           contexts[contextIndex].context = response.context;
         }
console.log(JSON.stringify('Response'+response.output));
         var intent = response.intents[0].intent;
         console.log(intent);
         if (intent == "shareinfo") {
           //contexts.splice(contexts.indexOf({'from': number, 'context': response.context}),1);
           //contexts.splice(contextIndex,1);
           // Call REST API here (order pizza, etc.)
		   var aadv= message;
		   console.log('PNR:'+aadv);

		   
		        }
		 request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:'EAALBr38ZAon8BAHzGgtL0SII7v8ZC3Hlq2IFfzVXy4ZBiEaaqdBZCfbOc7j8JJAt2pL0JsLCrCfGDiujTwhEvaKWsreWcK32KQIL9AIvBZBZCQbMOSt1eEnXbzQdMkhFXOnicPT3x7n72QvIduEyqZBZCqV5KOOxnIb67QIpMmufJQBME479Umja'},
    method: 'POST',
    json: {
      recipient: {id: number},
      message: {text: response.output.text[0]}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}
});
}
