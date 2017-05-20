'use strict';

var url = require('url');
var oauth = require('../utils/oauth')

var PostWithConsumerKeyCheck = require('./PostWithConsumerKeyCheckService');


module.exports.addPost = function addPost (req, res, next) {
	var send_1 = "-mzBAF1UFssV7H1VDrJuXQ45AZlkmfNEoMUxocsGae1f9f59!cba9cef300b64e3e812698fd7a8b6bff0000000000000000";
    var type = {'Content-Type': 'application/json'};

    var consumerKey = oauth.getConsumerKey(req);

    if (!consumerKey) {
        res.writeHead(500, type);
        res.end(JSON.stringify({error: "No Consumer Key found in Authorisation header. Consumer Key should be: " + send_1}));
        return;
    }

    if (consumerKey != ("\"" + send_1 + "\"")) {
        res.writeHead(500, type);
        res.end(JSON.stringify({error: "Consumer Key should be: " + send_1}));
        return;
    }
  	PostWithConsumerKeyCheck.addPost(req.swagger.params, res, next);
};
