var oauth = {};

oauth.getConsumerKey = function(req) {
    var authorizationValues = req.headers.authorization.split(",")

    for (var index in authorizationValues) {
        var map = authorizationValues[index].split("=")

        if(map[0].trim() == "oauth_consumer_key") {
            return map[1].trim();
        }
    }

    return null;
}

module.exports = oauth;