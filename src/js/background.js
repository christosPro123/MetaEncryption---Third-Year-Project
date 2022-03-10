let color = '#3aa757';
var cryptojs = require("crypto-js")

chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension Installed.');
    key256 = generateKey("metadata");
    vector = cryptojs.lib.WordArray.random(16);

    defaultValue = "Not set"
    chrome.storage.local.get({key: defaultValue}, function(result) {
        if (result.key == defaultValue){
            chrome.storage.local.set({key: key256}, function() {
                console.log("Key Set")
            });
        }
        else {
            var str = JSON.stringify(result.key)
            console.log(`Key Found  - ${str}`);
        }
    });

    chrome.storage.local.get({iv: defaultValue}, function (result) {
        if (result.iv == defaultValue){
            chrome.storage.local.set({iv: vector}, function () {
                console.log("IV Set");
            });
        }
            else {
                console.log('IV Found');
            }
    });
});

function generateKey(p){
    var salt = cryptojs.lib.WordArray.random(128/8);
    return cryptojs.PBKDF2(p, salt, { keySize: 256/32, iterations: 1000 });
};

