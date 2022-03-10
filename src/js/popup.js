var crypto = require('crypto-js')
let encrypt = document.getElementById("encrypt");
let decrypt = document.getElementById("decrypt");
let input_enc = document.getElementById("getfileEnc");
let input_dec = document.getElementById("getfileDec");


encrypt.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("ENCRYPT button clicked");
    input_enc.click();
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     function: startEncryption
    // });
});

decrypt.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("DECRYPT button clicked");
    input_dec.click();
    // chrome.scripting.executeScript({
    //     target: {tabId: tab.id},
    //     function: startDecryption
    // });
});

//      ----- ORIGINAL -----
// input_enc.addEventListener("change",  () => {
//    let files = input_enc.files;
//
//    if (files.length == 0)
//        return;
//
//    let file = files[0];
//
//    let reader = new FileReader();
//    reader.onload = (e) => {
//        const file  = e.target.result;
//        const lines = file.split(/\r\n|\n/);
//        alert(lines.join('\n'));
//    };
//
//    reader.onerror = (e) => alert(e.target.error.name);
//    reader.readAsText(file);
// });

//      ----- ORIGINAL ------
// input_dec.addEventListener("change", () => {
//     let files = input_dec.files;
//
//     if (files.length == 0)
//         return;
//
//     let file = files[0];
//
//     let reader = new FileReader();
//     reader.onload = (e) => {
//         const file  = e.target.result;
//         const lines = file.split(/\r\n|\n/);
//         alert(lines.join('\n'));
//     };
//
//     reader.onerror = (e) => alert(e.target.error.name);
//     reader.readAsText(file);
// });

//      ----- ENCRYPTION TEST ----
input_enc.addEventListener("change",  () => {
    let files = input_enc.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = () => {
        chrome.storage.local.get(['key','iv'], function(result) {
            var key = result.key;
            var iv = result.iv;
            var wordArray = crypto.lib.WordArray.create(reader.result);           // Convert: ArrayBuffer -> WordArray
            var encrypted = crypto.AES.encrypt(wordArray, key,{iv: iv}).toString();        // Encryption: I: WordArray -> O: -> Base64 encoded string (OpenSSL-format)

            var fileEnc = new Blob([encrypted]);                                    // Create blob from string

            var a = document.createElement("a");
            var url = window.URL.createObjectURL(fileEnc);
            var filename = file.name;
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };
    reader.readAsArrayBuffer(file);
});

//      ----- ENCRYPTION TEST -----
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
            var decrypted = crypto.AES.decrypt(reader.result, key,{iv: iv});               // Decryption: I: Base64 encoded string (OpenSSL-format) -> O: WordArray
            var typedArray = convertWordArrayToUint8Array(decrypted);               // Convert: WordArray -> typed array

            var fileDec = new Blob([typedArray]);                                   // Create blob from typed array

            var a = document.createElement("a");
            var url = window.URL.createObjectURL(fileDec);
            var filename = file.name.substr(0, file.name.length-4) + ".db";
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };
    reader.readAsText(file);
});

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