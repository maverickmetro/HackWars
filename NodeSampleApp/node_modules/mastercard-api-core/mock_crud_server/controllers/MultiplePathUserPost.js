'use strict';

var url = require('url');


var MultiplePathUserPost = require('./MultiplePathUserPostService');


module.exports.deleteUserPostWithMultiplePath = function deleteUserPostWithMultiplePath (req, res, next) {
  MultiplePathUserPost.deleteUserPostWithMultiplePath(req.swagger.params, res, next);
};

module.exports.readUserPostWithMultiplePath = function readUserPostWithMultiplePath (req, res, next) {
  MultiplePathUserPost.readUserPostWithMultiplePath(req.swagger.params, res, next);
};

module.exports.updateUserPostWithQueryBodyParameter = function updateUserPostWithQueryBodyParameter (req, res, next) {
  MultiplePathUserPost.updateUserPostWithQueryBodyParameter(req.swagger.params, res, next);
};
