var fs = require('fs');
var crypto = require('crypto');
var URL = require('url');
var queryString = require('querystring');
var forge = require('node-forge');
var utils = require('../../utils');
var error = require('../../error');

var OAuthParameters = require('./oauth-parameters');

/**
 * Create an OAuth security object for sending API requests
 *
 * @param consumerKey - consumer key from MasterCard Developer Zone
 * @param p12Path - path to .p12 file
 * @param alias - key alias for p12 key
 * @param password - password for p12 key
 * @constructor
 */
function OAuth(consumerKey, p12Path, alias, password) {
    if(!utils.isSet(consumerKey)) {
        throw new error.SDKError('Consumer key is not set');
    }

    if(!utils.isSet(p12Path)) {
        throw new error.SDKError('Path to .p12 file is not set');
    }

    if(!utils.isSet(alias)) {
        throw new error.SDKError('Key alias is not set');
    }

    if(!utils.isSet(password)) {
        throw new error.SDKError('Keystore password is not set');
    }

    this.consumerKey = consumerKey;
    this.privateKey = _getPrivateKey(p12Path, alias, password);

    /**
     * Sign the HTTP Request and return OAuth header value
     * @param uri
     * @param httpMethod
     * @param body
     * @returns {String} OAuth header value
     */
    this.sign = function (uri, httpMethod, body) {
        var oauthParams = new OAuthParameters(this.consumerKey);
        oauthParams.generateBodyHash(body);

        var signatureBaseString = _generateSignatureBaseString(uri.href, httpMethod, oauthParams);
        signatureBaseString = _postProcessSignatureBaseString(signatureBaseString);

        return _signRequest(oauthParams, this.privateKey, signatureBaseString)
    };
}

/**
 * Read the private key from the supplied p12 file
 *
 * @param p12Path
 * @param alias
 * @param password
 * @returns {*} PEM
 * @private
 */
var _getPrivateKey = function (p12Path, alias, password) {
    // 1) Read p12 file
    var p12File = fs.readFileSync(p12Path, 'binary');

    // Get asn1 from DER
    var p12Asn1 = forge.asn1.fromDer(p12File, false);

    // Get p12 using the password
    var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

    // Get Key from p12
    var keyObj = p12.getBags({
        friendlyName: alias,
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag
    }).friendlyName[0];

    if(!utils.isSet(keyObj)) {
        throw new error.SDKError("No key found for alias [" + alias + "]")
    }

    var key = keyObj.key;

    // Get private key as PEM
    var pem = forge.pki.privateKeyToPem(key);

    return pem;
};

/**
 * "private method" to generate the signature base string from the URL, request method, and parameters
 *
 * @param url - URL to connect to
 * @param requestMethod - HTTP request method
 * @param oauthParams - parameters containing authorization information
 * @returns {string|*} - signature base string generated
 * @private
 */
var _generateSignatureBaseString = function (url, requestMethod, oauthParams) {
    return _uriRfc3986Encode(requestMethod.toUpperCase()) +
        '&' +
        _uriRfc3986Encode((_normalizeUrl(url))) +
        '&' +
        _uriRfc3986Encode(_normalizeParameters(url, oauthParams));
};

/**
 * "private" method to sign the signature base string
 *
 * @param oauthParams - parameters containing authorization information
 * @param privateKey - URSA private key object
 * @param oauthParams
 * @param privateKey
 * @param signatureBaseString
 * @returns {*} authHeader
 * @private
 */
var _signRequest = function (oauthParams, privateKey, signatureBaseString) {
    var signer = crypto.createSign('RSA-SHA256');
    signer = signer.update(new Buffer(signatureBaseString));

    oauthParams.signature = signer.sign(privateKey, 'base64');
    oauthParams.signature = _uriRfc3986Encode(oauthParams.signature);
    oauthParams.signature = oauthParams.signature.replace('+', '%20');
    oauthParams.signature = oauthParams.signature.replace('*', '%2A');
    oauthParams.signature = oauthParams.signature.replace('~', '%7E');

    return _buildAuthHeaderString(oauthParams);
};

/**
 * "private" method to build the authorization header from the contents of the oauth parameters
 *
 * @param oauthParams - object containing authorization information
 * @returns {string} - authorization header
 * @private
 */
var _buildAuthHeaderString = function (oauthParams) {
    var header = '';
    header = header + 'oauth_consumer_key' + '="' + oauthParams.consumerKey + '",';
    header = header + 'oauth_nonce' + '="' + oauthParams.nonce + '",';
    header = header + 'oauth_signature' + '="' + oauthParams.signature + '",';
    header = header + 'oauth_signature_method' + '="' + oauthParams.signatureMethod + '",';
    header = header + 'oauth_timestamp' + '="' + oauthParams.timeStamp + '",';
    header = header + 'oauth_version' + '="' + oauthParams.oauthVersion + '"';

    if (oauthParams.bodyHash) {
        header = 'OAuth ' + 'oauth_body_hash'
            + '="' + oauthParams.bodyHash + '",' + header;
    }
    else {
        header = 'OAuth ' + header;
    }

    return header;
};


/**
 * "private" method to strip off the querystring parameters and port from the URL
 *
 * @param url - url to modify
 * @returns {*} - normalized URL
 * @private
 */
var _normalizeUrl = function (url) {
    var tmp = url;

    // strip query portion
    var idx = url.indexOf('?');
    if (idx) {
        tmp = url.substr(0, idx);
    }

    // strip port
    if (tmp.lastIndexOf(':') && tmp.lastIndexOf(':') > 5) {
        // implies port is given
        tmp = tmp.substr(0, tmp.lastIndexOf(':'));
    }

    return tmp;
};

/**
 * "private" method to put querystring and oauth parameters in lexical order
 *
 * @param url - url containing query string parameters
 * @param oauthParams - object containing authorization info
 * @returns {string} - normalized parameter string
 * @private
 */
var _normalizeParameters = function (url, oauthParams) {
    var uri = URL.parse(url);

    // Always has at least ?Format=JSON
    var qstringHash = queryString.parse(uri.search.split('?')[1]);
    var oauthHash = oauthParams.generateParametersHash();

    var nameArr = [];
    var idx = 0;

    for (var qStringKey in qstringHash) {
        nameArr[idx] = qStringKey;
        idx++;
    }

    for (var oauthKey in oauthHash) {
        nameArr[idx] = oauthKey;
        idx++;
    }

    nameArr.sort(); // now params are in alphabetical order

    var parm = '';

    for (var i = 0; i < nameArr.length; i++) {

        
        if (i > 0) {
            parm += '&';
        }
        
        if (qstringHash[nameArr[i]]) {
            parm += _uriRfc3986Encode(nameArr[i]) + '=' + _uriRfc3986Encode(qstringHash[nameArr[i]]);
        }
        else {
            parm += _uriRfc3986Encode(nameArr[i]) + '=' + _uriRfc3986Encode(oauthHash[nameArr[i]]);
        }
    }
    return parm;
};

var _uriRfc3986Encode = function (input) {
    str = (input + '');

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below),
    // but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
};

/**
 *
 * @param signatureBaseString
 * @returns {*}
 * @private
 */
var _postProcessSignatureBaseString = function (signatureBaseString) {
    signatureBaseString = signatureBaseString.replace(/%20/g, '%2520');
    signatureBaseString = signatureBaseString.replace('!', '%21');
    return signatureBaseString
};

module.exports = OAuth;