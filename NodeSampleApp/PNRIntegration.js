const http = require('http');

//const hostname = '127.0.0.1';
//const port = 3000;


var requestStructure= {
  host: '207.138.132.95',  
  port : 13035,
  path : '/import/imperialcoders/retrieveCustomerInfo/pnr/QWEKRL',
  method: 'GET'
  }

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



const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  
  getJSON(requestStructure, function(err,result)
  {
  if(err)
  {
  return console.log("Got an error while execution");
  }
  console.log('Going to parse json');
  console.log (result.AADV);
  //console.log(result.results[0].address_components[0].long_name);
  
  //console.log(result);
  });
