// ==UserScript==
// @name         Jumpcloud S3 Redirect - DCD Media
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically redirect to the DCD Media folders on S3 when logging in from Jumpcloud
// @author       Nathan Kean
// @match        https://us-east-2.console.aws.amazon.com/console/home?region=us-east-2
// @grant        none
// @run-at document-start
// ==/UserScript==

(function() {
    'use strict';

    window.location.replace("https://s3.console.aws.amazon.com/s3/buckets/platform.s3.us-east-2.prd.totalexpert/media_dcd/?region=us-east-2&tab=overview");
})();