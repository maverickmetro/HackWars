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

var pkgJson = require('../package.json');

/**
 * This module defines is an object with constant values.
 *
 * @class constants
 * @static
 */
var constants = {};

/**
 * Version of the SDK
 * Retrieved from package.json
 *
 * @type {string}
 */
constants.VERSION = pkgJson.version;

/**
 * The URL for all Production API requests
 *
 * @type {string}
 */
constants.API_BASE_PRODUCTION_URL = "https://api.mastercard.com";

/**
 * The URL for all SANDBOX API requests
 *
 * @type {string}
 */
constants.API_BASE_SANDBOX_URL = "https://sandbox.api.mastercard.com";

/**
 * This is the Environment enums which are idenfified in the system
 */
constants.Environment = {
    PRODUCTION: "production",
    SANDBOX: "sandbox",
    SANDBOX_MTF: "sandbox_mtf",
    SANDBOX_ITF: "sandbox_itf",
    STAGE: "stage",
    DEV: "dev",
    PRODUCTION_MTF: "production_mtf",
    PRODUCTION_ITF: "production_itf",
    STAGE_MTF: "stage_mtf",
    STAGE_ITF: "stage_itf",
    LOCALHOST: "localhost",
    OTHER: "other",

};

/**
 * This is the Mapping where an environment is mapped to 
 * Host and Context
 */
constants.Mapping = {
    "production": ["https://api.mastercard.com", null],
    "sandbox": ["https://sandbox.api.mastercard.com", null],
    "sandbox_mtf": ["https://sandbox.api.mastercard.com", "mtf"],
    "sandbox_itf": ["https://sandbox.api.mastercard.com", "itf"],
    "stage": ["https://stage.api.mastercard.com", null],
    "dev": ["https://dev.api.mastercard.com", null],
    "production_mtf": ["https://api.mastercard.com", "mtf"],
    "production_itf": ["https://api.mastercard.com", "itf"],
    "stage_mtf": ["https://stage.api.mastercard.com", "mtf"],
    "stage_itf": ["https://stage.api.mastercard.com", "itf"],
    "localhost": ["http://localhost:8081", null]

};

module.exports = constants;
