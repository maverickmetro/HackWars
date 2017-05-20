/*
 * Copyright 2016 MasterCard International.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 * Neither the name of the MasterCard International Incorporated nor the names of its
 * contributors may be used to endorse or promote products derived from this software
 * without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 */

/**
 * This module exposes the different domain object on which different API calls can be invoked upon.
 *
 * @class MasterCardAPI
 * @static
 */
var MasterCardAPI = {};

// Imports
var mastercardError = require('./lib/error');
var constants = require('./lib/constants');
var oauth = require("./lib/security/oauth/oauth");
var operationConfig = require("./lib/operation-config");
var operationMetaData = require("./lib/operation-metadata");
var utils = require("./lib/utils");
var http = require('http');
var https = require('https');
var url = require('url');

// Variables
var authentication = null;
var initialized = false;
var registeredInstances = {};

var debug = false;
var test = false;
var environment = constants.Environment.SANDBOX;

/**
 * Initialize the Core MasterCard API SDK
 *
 * @param opts
 *  {Boolean} sandbox - true (use sandbox), false (use production)
 *  {Boolean} authentication - authentication object e.g. MasterCardAPI.OAuth
 */
MasterCardAPI.init = function (opts) {
    

    //arizzini: backward compatible
    if (utils.isSet(opts.sandbox)) {
        if (opts.sandbox == true) {
            environment = constants.Environment.SANDBOX;
        } else {
            environment = constants.Environment.PRODUCTION;
        }
    } else if (utils.isSet(opts.environment)) {
        environment = opts.environment;
    } else {
        environment = constants.Environment.SANDBOX;
    }
    
    MasterCardAPI.setEnvironment(environment);
    
    
    if (utils.isSet(opts.debug)) {
        debug = opts.debug;
    } else {
        debug = false;
    }

    if (utils.isSet(opts.authentication)) {
        authentication = opts.authentication;
    }
    else {
        throw new Error("Authentication must be set");
    }

    initialized = true;
};

MasterCardAPI.setEnvironment = function(env) {
    for (var resourceConfigKey in registeredInstances) {
        registeredInstances[resourceConfigKey].setEnvironment(env);
    }
    environment = env;
}

MasterCardAPI.registerResourceConfig = function(instance) {
//    console.log("registerResourceConfig.... "+instance.getName());
    if (! (instance.getName() in registeredInstances)) {
//        console.log("registered.... ");
        registeredInstances[instance.getName()] = instance;
    }
};

MasterCardAPI.getEnvironment = function() {
    return environment;
};





/**
 * Function to execute an API call.
 *
 * @param {Object} opts
 *      {String} path - The path for the API
 *      {String} action - The type of action being invoked on the domain object
 *      {Object} params - The request parameters
 * @param {Function} callback - A callback function to handle an success/error responses from the API
 */
MasterCardAPI.execute = function (opts, callback) {

    try {
        // Check SDK has been correctly initialized
        _checkState();

        var operationConfig = opts.operationConfig;
        var operationMetaData = opts.operationMetaData;
        var params = opts.params;
        var headerParams = utils.subMap(params, operationConfig.headerParams);

        var uri, httpMethod;

        uri = _getURI(params, operationConfig, operationMetaData);
        httpMethod = _getHttpMethod(operationConfig.action);
        var body = JSON.stringify(params);
        var authHeader = authentication.sign(uri, httpMethod, body);
        
        
        var requestOptions = _getRequestOptions(httpMethod, uri, authHeader, headerParams, operationMetaData);
        
        if (debug) {
            console.log( "---- Request ----");
            console.log( "URL");
            console.log( httpMethod+"="+uri.href);
            console.log( "");
            console.log( "Headers");
            console.log( JSON.stringify(requestOptions.headers) );
            console.log( "");
            console.log( "Body" );
            console.log( body );
            console.log( "------------------");
            console.log( "" );

        }
        
        protocol = http;
        if (uri.protocol === "https:") {
            protocol = https;
        }

        // Exec async API HTTP request
        var httpRequest = protocol.request(requestOptions, function (httpResponse) {
            
            var httpResponseData = "";

            httpResponse.setEncoding('utf8');

            // Handle successful response
            httpResponse.on('data', function (data) {
                httpResponseData += data;
            });

            httpResponse.on('end', function () {

                var statusCode = httpResponse.statusCode
                
                if (debug) {
                    console.log( "---- Response ----");
                    console.log( "Statis");
                    console.log( statusCode);
                    console.log( "");
                    console.log( "Headers");
                    console.log( JSON.stringify(httpResponse.headers) );
                    console.log( "");
                    console.log( "Body" );
                    console.log( httpResponseData );
                    console.log( "------------------");
                    console.log( "");
                }
                

                if (statusCode < 300) {
                    var jsonResponse = null;

                    try {
                        if (httpResponseData && httpResponseData.length > 0) {
                            jsonResponse = JSON.parse(httpResponseData);
                        }
                    }
                    catch (e) {
                        console.error("Error parsing json response. Status: " + statusCode)
                    }

                    // NB: Don't want to call callback in catch above as if the callback function throws an error it
                    // will go back into the catch
                    callback(null, jsonResponse);
                }
                else {
                    var error = httpResponseData;

                    try {
                        if (httpResponseData && httpResponseData.length > 0) {
                            error = JSON.parse(httpResponseData);
                        }
                    }
                    catch (e) {
                        console.error("Error parsing json-error response. Status: " + statusCode)
                    }

                    callback(new mastercardError.APIError('Error executing API call', error, statusCode), null);
                }
            });
        }).on('error', function (errorResponse) {

            var errorStatusCode = errorResponse.statusCode

            // Catch our timeout error thrown below
            if (errorResponse.code === "ECONNRESET") {
                callback(new mastercardError.APIError('The API request has timed out', errorResponse, errorStatusCode), null);
            } else if (errorResponse.code === "ECONNREFUSED") {
                callback(new mastercardError.APIError('The API server refused the connection', errorResponse, errorStatusCode), null);
            } else {
                callback(new mastercardError.APIError('Error executing API call', errorResponse, errorStatusCode), null);
            }
            // Return error from API call
            
        }).on('socket', function (socket) {

            // Set timeout on the HTTP request
            socket.setTimeout(30000);
            socket.on('timeout', function () {
                // Killing the request which throws an Error and is caught above in the error block
                httpRequest.abort();
            });
        }); 

        // If POST request, then write to the body of the request
        if (requestOptions.method === "POST" || requestOptions.method === "PUT") {
            httpRequest.write(body);
        }

        httpRequest.end();
    }
    catch(e) {
        callback(e, null);
    }

};

/**
 * Function to check whether a value/object is 'undefined', null, false or empty.
 * Expose for use in SDKs
 *
 * @param {Object} value - Object to check
 * @return {Boolean} Returns true if object's type is 'undefined'
 */
MasterCardAPI.isSet = function (value) {
    return utils.isSet(value);
};
/**
 * Function to check if the SDK has been initialized correctly.
 *
 * @private
 * @return {Boolean} Returns true if both Consumer Key and Authentication are set
 * @throws mastercardError.APIError
 */
function _checkState() {
    // Check if initialized
    if (!initialized) {
        throw new mastercardError.SDKError('MasterCardAPI.init(opts) must be called');
    }
     
    if (test === false)
    {
        if (!utils.isSet(authentication)) {
            throw new mastercardError.SDKError('Authentication must be set');
        }

        if (!utils.isSet(authentication.consumerKey)) {
            throw new mastercardError.SDKError('Consumer Key is not set');
        }
    }

    return true;
}


/**
 * Function to build up the URI endpoint to use in the request.
 *
 * @private
 * @param {Object} params - The request parameters
 * @param {Object} operationConfig
 * <pre>
 *  path - The path for the API<br>
 *  action - The type of action being invoked on the domain object<br>
 *  queryParams - List of additional query parameters to support where Query and Body parameters used for create / update
 * </pre>
 * @param {Object} operationMetaData<br>
 * <pre>
 *  host - the host to send to if overridden
 * </pre>
 *
 * @return {Object} Returns a URI object needed for a HTTP request
 */
function _getURI(params, operationConfig, operationMetaData) {
    var uri = uri = operationMetaData.host

    var resourcePath = operationConfig.path;
    
    if (resourcePath.indexOf("#env") > 0) {
        //arizzini: we have found an envirment marker
        var tmpContext = "";
        if (utils.isSet(operationMetaData.context)) {
            tmpContext = operationMetaData.context;
        }
        resourcePath = resourcePath.replace("#env", tmpContext);
        //arizzini: just in case we passig empty in the env which causes to form
        //double forward slash in the url.
        resourcePath = resourcePath.replace("//", "/");
    }
    
    // Modify URI to point to the correct API path
    uri = uri + resourcePath;
    
    // replace the path parameters
    uri = _replacePathParameters(uri, params);

    // Add query params to URI if any
    switch (operationConfig.action) {
        case "read":
        case "list":
        case "delete":
        case "query":
            uri = _appendMapToQueryString(uri, params);
            break;
    }

    // create and update may have Query and Body parameters as part of the request.
    // Check additionalQueryParametersList is set
    if (utils.isSet(operationConfig.queryParams)) {
        switch (operationConfig.action) {
            case "create":
            case "update":
                // Get the submap of query parameters which also removes the values from objectMap
                var queryParams = utils.subMap(params, operationConfig.queryParams);
                uri = _appendMapToQueryString(uri, queryParams);
                break;
        }
    }

    // Add Format=JSON
    uri = _appendMapToQueryString(uri, { Format: "JSON" });
    
    // Use node js 'url' module to create URI object
    return url.parse(uri);
};



var _replacePathParameters = function(path, map)
{
    var pathParameterRegex = /(\{.*?\})/g;
    var pathToReplace = path;
    
    var match = pathParameterRegex.exec(path);
    while (match != null) {

        // get the first matching group
        var group = match[0];
        // extract the key value by removing {}
        var key = group.slice(1, -1);

        if (key in map) {
            // replace {user_id} with id in the map
            pathToReplace = pathToReplace.replace(group, map[key]);

            // remove the replace value from the map
            delete map[key];
        } else {
            // something went wrong.. p45
            throw new mastercardError.SDKError("Required path parameter: '"+key+"' not found on input map");
        }

        // iterate to next
        match = pathParameterRegex.exec(path);
    }
   
    return pathToReplace;

};

/**
 * Append map as parameters to URL
 *
 * @param {Object} map
 * @param {String} uri - the current uri
 * @returns {String} uri
 */
var _appendMapToQueryString = function(uri, map) {
    for (var key in map) {
        uri = _appendQueryString(uri, key, map[key]);
    }

    return uri;
};

/**
 * Append a key and value as a parameter to the uri
 *
 * @param {String} uri
 * @param {String} key
 * @param {Object} value
 * @returns {string|*}
 * @private
 */
var _appendQueryString = function(uri, key, value) {
    if (uri.indexOf("?") == -1) {
        uri += "?";
    }

    if (uri.indexOf("?") != uri.length - 1) {
        uri += "&";
    }

    uri += key + "=" + value;

    return uri;
};


/**
 * Function to construct the options map needed for the API request.
 *
 * @private
 * @param {String} httpMethod - The type of HTTP request being made e.g. 'POST'
 * @param {Object} uri - An object containing the properties of a URI
 * @param {String} authHeader - String containing Authorization header data
 * @param {Object} headerParam - An map containing the extra header parames which needs to be added
 * @param {Object} operationMetaData - contains SDK version
 *
 * @returns request options map
 */
function _getRequestOptions(httpMethod, uri, authHeader, headerParam, operationMetaData) {

    var returnObj = {
        host: uri.hostname,
        port: uri.port,
        path: uri.path,
        method: httpMethod,
        headers: {
            "Accept": "application/json",
            "Authorization": authHeader,
            "Content-Type": "application/json",
            "User-Agent": "NodeJS-Core-SDK/" + constants.VERSION + "; NodeJS-SDK/" + operationMetaData.version
        }
    };
    
    // need to add the additional headers
    for (var key in headerParam) {
        returnObj.headers[key] = headerParam[key];
    }
    
    return returnObj;
    

}

/**
 * Function to choose the appropriate HTTP method based on the API action.
 *
 * @private
 * @param {String} action - The type of action being invoked on the domain object
 * @return {String} Returns a HTTP request type e.g. 'POST'
 */
function _getHttpMethod(action) {
    var httpMethod;

    if (action === "create") {
        httpMethod = "POST";
    }
    else if (action === "delete") {
        httpMethod = "DELETE";
    }
    else if (action === "update") {
        httpMethod = "PUT";
    }
    else if (action === "read" || action === "list" || action === "query") {
        httpMethod = "GET";
    }
    else {
        throw new mastercardError.SDKError("Unknown action [" + action + "]");
    }

    return httpMethod;
}

// Expose classes
MasterCardAPI.OAuth = oauth;
MasterCardAPI.OperationConfig = operationConfig;
MasterCardAPI.OperationMetaData = operationMetaData;
MasterCardAPI.MasterCardError = mastercardError;


//arizzini: if you need to expose private function only during unit testing use this
if (typeof global.it === 'function') {
    // START EXPOSE PRIVATE FUNCTION FOR TESTING
    var port = process.env.JENKINS_PORT ? process.env.JENKINS_PORT : 8080;
    
    MasterCardAPI.getUri = function(params, operationConfig, operationMetaData) {
        return _getURI(params, operationConfig, operationMetaData);
    };
    
    MasterCardAPI.getRegisteredResourceConfigCount = function() {
        return Object.keys(registeredInstances).length;
    };
    
    MasterCardAPI.clearResourceConfig = function() {
        registeredInstances = {};
    };

    
    MasterCardAPI.reset = function() {
        environment = constants.Environment.SANDBOX;
    }
    
    MasterCardAPI.getRequestOptions = function (httpMethod, uri, authHeader, headerParam, operationMetaData) {
        return _getRequestOptions(httpMethod, uri, authHeader, headerParam, operationMetaData);
    };
    
    MasterCardAPI.testInit = function (opts) {
        test = true;
        sandbox = true;
        initialized = true;
        authentication = opts.authentication
        
    };



    // END EXPOSE PRIVATE FUNCTION FOR TESTING
}



// Export our object for use.
module.exports = MasterCardAPI;
