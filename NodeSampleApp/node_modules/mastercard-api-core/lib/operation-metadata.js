/**
 *
 * @param version
 * @param host
 * @param environment
 */
var operationMetadata = function (version, host, context) {
    this.version = version;
    this.host = host;
    this.context = context;
};

module.exports = operationMetadata;