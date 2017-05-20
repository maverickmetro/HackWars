/**
 *
 * @param path
 * @param action
 * @param queryParams
 * @param headerParams
 */
var operationConfig = function (path, action, queryParams, headerParams) {
    this.path = path;
    this.action = action;
    this.queryParams = queryParams;
    this.headerParams = headerParams;
};

module.exports = operationConfig;