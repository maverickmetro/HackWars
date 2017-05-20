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
  var AADVrequestStructure= {
  host: '207.138.132.95',  
  port : 54781,
  path : '/import/imperialcoders/searchAADV/90PRU10',
  method: 'GET'
  }
  var DepositMiles= {
  host: '207.138.132.95',  
  port : 50677,
  path : '/import/imperialcoders/postMiles/AADV/90ACV34/currentmilebalance/5000/milespost/2000',
  method: 'GET'
  }
    var FlightDelay= {
  host: '207.138.132.95',  
  port : 39418,
  path : '/import/imperialcoders/flightDelayInfo/flightno/5960/origin/DFW/depDate/20170520',
  method: 'GET'
  }
    var offering= {
  host: '207.138.132.95',  
  port : 6556,
  path : '/import/imperialcoders/recommendCompensation/tier/platinumpro',
  method: 'GET'
  }
  var CompensationMessage='Your AADV:';
  var disbursements = require('mastercard-disbursements');
var MasterCardAPI = disbursements.MasterCardAPI;

var consumerKey = "4FZDE2qryKsPPqA1NwXbbBku3bNHhHZrpZLowyMP6b729703!f435de5c8fe3425aacf9d3b1912611ca0000000000000000";   // You should copy this from "My Keys" on your project page e.g. UTfbhDCSeNYvJpLL5l028sWL9it739PYh6LU5lZja15xcRpY!fd209e6c579dc9d7be52da93d35ae6b6c167c174690b72fa
//var keyStorePath = "C:\\Lipi\\HackWars\\hackathonalias-sandbox.p12"; 
var keyStorePath="C:\\Users\\947713\\Documents\\Sathish\\CT-SOA\\Hackwars\\hackathonalias-sandbox.p12";
var keyAlias = "hackathonalias";   // For production: change this to the key alias you chose when you created your production key
var keyPassword = "aahackathon";   // For production: change this to the key alias you chose when you created your production key
var authentication = new MasterCardAPI.OAuth(consumerKey, keyStorePath, keyAlias, keyPassword);
MasterCardAPI.init({
	sandbox: true,
	authentication: authentication
});


var contexts = [];
var event_id;

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
		  var facebookid=event.sender.id;
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

http.request(options, function(res){
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

function sendtoMessanger(options, caller_id)
{
request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:'EAAbhOU9KeZA4BAHO4wZCfIKcHDlH3vZCEUfocU92CbvZCDkMmxyFoQB38KLhTZAa6MSShlEPuZAvKsXCgPJZCLlXBHRHqNuJ1SG7G3BMfY3ygwrxInQehkAOXhrtuVxdEyZCgW6djoDmjTbTtaeb5nAbT3KHoCujfjCphhVc8zkwwgZDZD'},
    method: 'POST',
    json: {
      recipient: {id:caller_id},
      message: {text:options}
    }
  });
}
function sendtoMessangerCust(options, caller_id)
{
request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:'EAAbhOU9KeZA4BAHO4wZCfIKcHDlH3vZCEUfocU92CbvZCDkMmxyFoQB38KLhTZAa6MSShlEPuZAvKsXCgPJZCLlXBHRHqNuJ1SG7G3BMfY3ygwrxInQehkAOXhrtuVxdEyZCgW6djoDmjTbTtaeb5nAbT3KHoCujfjCphhVc8zkwwgZDZD'},
    method: 'POST',
    json: {
      recipient: {id:caller_id},
      message: {text:options}
    }
  });
}
function depositMiles(numbers)
{
getJSON(DepositMiles, function(err,result)
  {
  if(err)
  {
  return console.log("Got an error while execution");
  }
  console.log('Going to parse Miles json');
  console.log(result.MilesPosted);
  var milesMessage= " We have posted "+result.MilesPosted+" your Account now your New Miles Balance:"+result.UpdatedMileBalance +"/n"+" Thank you for your continued loyalty with American Airlines, is there anything else I can help you with";
  //console.log(result.results[0].address_components[0].long_name);
  
  
  
  sendtoMessanger(milesMessage, numbers);
  sendtoMessanger("Thank you for your continued loyalty with American Airlines, is there anything else I can help you with", number);
  //console.log(result);
  });
}
var delayHours='';
var miles='';
var creditAmount='';
function getCompensation(numbers)
{
getJSON(FlightDelay, function(err,result)
  {
  if(err)
  {
  return console.log(err);
  }
  console.log('Going to parse Flight Delay json');
  delayHours=(result.flightDelayInfo.flightDelayMins);
  console.log('delay: '+delayHours);
  
  getJSON(offering, function(err,result)
  {
  if(err)
  {
  return console.log(err);
  }
  console.log('Going to parse offerings json');
  //var delayHours=(result.flightDelayInfo.flightDelayMins);
  
  
  miles=result.MilesAmount;
  creditAmount=result.VoucherAmount;
  var compensation_message="Daniel, looks like your flight is delayed by "+delayHours+" hours. Can I offer you a $"+creditAmount+" credit or "+miles+" Advantage miles?";

  //console.log(result.MilesPosted);
  //var milesMessage= " We have posted "+result.MilesPosted+" your Account now your New Miles Balance:"+result.UpdatedMileBalance;
  //console.log(result.results[0].address_components[0].long_name);
  sendtoMessanger(compensation_message, numbers);
  //console.log(result);
  });
  
   //var compensation_message="Daniel, looks like your flight is delayed by "+delayHours+" hours";

  //console.log(result.MilesPosted);
  //var milesMessage= " We have posted "+result.MilesPosted+" your Account now your New Miles Balance:"+result.UpdatedMileBalance;
  //console.log(result.results[0].address_components[0].long_name);
  //ndtoMessanger(compensation_message, numbers);
  //console.log(result);
  });
  /*getJSON(offering, function(err,result)
  {
  if(err)
  {
  return console.log(err);
  }
  console.log('Going to parse offerings json');
  //var delayHours=(result.flightDelayInfo.flightDelayMins);
  
  
  var miles=result.MilesAmount;
  var creditAmount=result.VoucherAmount;
  var compensation_message="Daniel, looks like your flight is delayed by "+delayHours+" hours. Can I offer you a $"+creditAmount+" credit or "+miles+" Advantage miles?";

  //console.log(result.MilesPosted);
  //var milesMessage= " We have posted "+result.MilesPosted+" your Account now your New Miles Balance:"+result.UpdatedMileBalance;
  //console.log(result.results[0].address_components[0].long_name);
  sendtoMessanger(compensation_message, numbers);
  //console.log(result);
  });*/
}

function depositmoney(number)
{
	var requestData = {
  "payment_disbursement": {
    "disbursement_reference": Math.round(new Date().getTime()/1000),
    "amount": creditAmount,
    "currency": "USD",
    "payment_type": "BDB",
    "recipient_account_uri": "pan:5013040000000018;exp\u003d2017-05",
    "recipient": {
      "first_name": "Jane",
      //"middle_name": "Tyler",
      "last_name": "Smith",
      //"nationality": "USA",
      //"date_of_birth": "1999-12-30",
      /*"address": {
        /"line1": "1 Main St",
        "line2": "Apartment 9",
        "city": "OFallon",
        "country_subdivision": "MO",
        "postal_code": "63368",
        "country": "USA"
      },
      "phone": "11234567890",
      "email": "Jane.Smith123@abcmail.com"
//,
  //   "government_ids": {
    //   "government_id_uri": "ppn:123456789;expiration-date\u003d2019-05-27;issue-date\u003d2011-07-12;issuing-country\u003dUSA;issuing-place\u003dOFallon"
      //}*/
    },
    "payment_origination_country": "USA",
    "sanction_screening_override": "true",
    "reconciliation_data": {
      "custom_field": [
        {
          "name": "ABC",
          "value": "123"
        },
        {
          "name": "DEF",
          "value": "456"
        },
        {
          "name": "GHI",
          "value": "789"
        }
      ]
    },
    "statement_descriptor": "TST*CLAIM 12345",
    "participant": {
      "merchant_category_code": "4121",
      "card_acceptor_id": "CardAcceptor123",
      "customer_service_contact_info": "18005559999"
    }
  },
  "partnerId": "ptnr_2370-10D6-ED32-C98E"
};

disbursements.Disbursement.create(requestData
, function (error, data) {
	if (error) {
		console.error("An error occurred");
		console.error(error);
	}
	else {
		sendtoMessanger("The card ending in 4523 on your profile has been credited with: $"+creditAmount+ " Ref # "+data.disbursement.transaction_history.data.transaction.system_trace_audit_number+ "\n"+ "Thank you for your continued loyalty with American Airlines, is there anything else I can help you with", number);
		console.log(data.disbursement.id);     //Output-->dsb_b7bV5cYZIOrewrPg70JShED7ZILk
		//sendtoMessanger("Thank you for your continued loyalty with American Airlines, is there anything else I can help you with", number);
		
	}
});
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
		   console.log ('number:'+contexts.splice(contexts.indexOf({'from': number, 'context': response.context}),1));
		  // getJSON(PNRrequestStructure, function(err,result)
		   getJSON(AADVrequestStructure, function(err,result)
  {
  if(err)
  {
  return console.log("Got an error while execution");
  }
  console.log('Going to parse json');
  var name=result.Name;
  var fly_nbr=result.flightDetails.fltNumber;
  var origin=result.flightDetails.fltOrigin;
  var dest=result.flightDetails.fltDestination;
  //console.log(result.results[0].address_components[0].long_name);
  var Chat_msg=name+" are you traveling on flight "+  fly_nbr+ " from  "+origin+" to "+dest+" today";
  sendtoMessanger(Chat_msg, number);
  //getCompensation(number);
  //console.log(result);
  });

		   
		        }
				 if (intent == "getVouchers") {
					 console.log ('i got the voucher');
					 depositmoney(number);
					 
				 }
				  if (intent == "getmiles") {
					 console.log ('i got the Miles');
					 depositMiles(number);
					 
				 }
				 if (intent == "flightAgree") {
					 console.log ('Yay You Aggreed');
					 sendtoMessanger("Let me see whats going on", number);
					 getCompensation(number);
					 
				 }
		 request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:'EAAbhOU9KeZA4BAPJO3WOttZCAO82BFiDEiWvElGOOiFgd6KiEWZBndQQEBJZBmNZB7bG4G6MorWM30qQgs48OvQcTsFcTn7ZA79JEV0ZBeUdGpmm33zC6VdYZBFQDIYusWRatbvjIO40tCx9CYZAREFtwUbPZAPFLJBtcTXAoyuQGeawZDZD'},
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
