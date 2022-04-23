var crypto = require('crypto-js');
var filesaver = require('file-saver');
let encrypt = document.getElementById("encrypt");
let decrypt = document.getElementById("decrypt");
let changeKey = document.getElementById("changeKey")
let input_enc = document.getElementById("getfileEnc");
let input_dec = document.getElementById("getfileDec");


//Listener For "Encrypt" Button - initialises encryption process
encrypt.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("ENCRYPT button clicked");
    input_enc.click();
});

//Listener for "Decrypt" Button - Initialises decryption Process
decrypt.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("DECRYPT button clicked");
    input_dec.click();
});

changeKey.addEventListener("click", async () => {
    console.log("CHANGE KEY button clicked");
    getUserKey();
})



//Encryption Process
//Retrieval of key and IV from chrome storage API, passes them onto CryptoJS to use for AES encryption
//File is read as array buffer and passed as an arguement to CryptoJS to create a WordArray object
//Encrypts WordArray with key and IV using AES, creates a blob from the B64 encoded string
//A URL is then made for the blob, and passed into chrome.downloads API to open a "Save As" dialog for downloading it
input_enc.addEventListener("change",  () => {
    let files = input_enc.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = () => {
        chrome.storage.local.get(['key','iv'], function(result) {
            var key = result.key;
            var iv = result.iv;

            // Convert: ArrayBuffer -> WordArray
            var wordArray = crypto.lib.WordArray.create(reader.result);

            // Encryption: I: WordArray -> O: -> Base64 encoded string (OpenSSL-format)
            var encrypted = crypto.AES.encrypt(wordArray, key,{iv: iv}).toString();

            // Create blob from string
            var fileEnc = new Blob([encrypted]);

            var a = document.createElement("a");
            var url = window.URL.createObjectURL(fileEnc);
            var filename = file.name;

            chrome.downloads.download({
                    filename: filename,
                    url: url,
                    saveAs: true
                }, function (downloadId){
                    console.log(downloadId);
                }
            );
        });
    };
    reader.readAsArrayBuffer(file);
});


//Decryption Process
//Similar to Encryption - differences being file is read as text instead of an array buffer (B64 encoded string)
//The decrypted WordArray is then made into a typed array of unsigned 8bit integers, that can then be made into
// a blob of type "application/octet-stream", the type that is read and expected by Chrome
input_dec.addEventListener("change", () => {
    let files = input_dec.files;

    if (files.length == 0)
        return;

    let file = files[0];

    var reader = new FileReader();
    reader.onload = () => {
        chrome.storage.local.get(['key','iv'], function(result) {
            var key = result.key;
            var iv = result.iv;

            // Decryption: I: Base64 encoded string (OpenSSL-format) -> O: WordArray
            var decrypted = crypto.AES.decrypt(reader.result, key,{iv: iv});

            // Convert: WordArray -> typed array
            var typedArray = convertWordArrayToUint8Array(decrypted);

            // Create blob from typed array
            var fileDec = new Blob([typedArray],{type: 'application/octet-stream'});

            var a = document.createElement("a");
            var url = window.URL.createObjectURL(fileDec);
            var filename = file.name.split('.')[0];

            // "../AppData/Local/Google/Chrome/User Data/Default/"
            chrome.downloads.download({
               filename: filename,
               url: url,
               saveAs: true
            }, function (downloadId){
                console.log(downloadId);
                }
             );
        });
    };
    reader.readAsText(file);
});


//Helper Function that transforms a WordArray into a array of 8bit unsigned integers
function convertWordArrayToUint8Array(wordArray) {
    var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
    var length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
    var uInt8Array = new Uint8Array(length), index=0, word, i;
    for (i=0; i<length; i++) {
        word = arrayOfWords[i];
        uInt8Array[index++] = word >> 24;
        uInt8Array[index++] = (word >> 16) & 0xff;
        uInt8Array[index++] = (word >> 8) & 0xff;
        uInt8Array[index++] = word & 0xff;
    }
    return uInt8Array;
}


function getUserKey(){
    let userKey = window.prompt("Input new encryption key");
    if (userKey == null)
        return;
    alert(userKey);
}