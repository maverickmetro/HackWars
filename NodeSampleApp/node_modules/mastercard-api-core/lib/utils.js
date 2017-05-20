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
 * This module exposes utility methods
 *
 * @class masterCardUtils
 * @static
 */
var masterCardUtils = {};

/**
 * Function to check whether a value/object is 'undefined', null, false or empty.
 *
 * @param {Object} value - Object to check
 * @return {Boolean} Returns true if object's type is 'undefined'
 */
masterCardUtils.isSet = function (value) {
    return typeof value !== "undefined" && value !== null && value.length != 0;
};


/**
 * Creates a new map using the keys in the list
 * 
 *  @param {Object} map
 *  @param {Array} keylist
 *  @param {Object} subMap
 */
masterCardUtils.subMap = function(map, keylist)
{
    var subMap = new Array();
    
    //iterate throught the keylist
    for (var key in map) {
        // if one key is also in the map 
      	if (keylist.indexOf(key) > -1) {
            //add it to the new submap
            subMap[key] = map[key];
            //also remove the key and value from the orginal map
            delete map[key];
        }
    }
    return subMap;
};


// Export our module
module.exports = masterCardUtils;