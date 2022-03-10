const path = require('path');

module.exports = [{
    entry: './src/js/background.js',
    output: {
        filename: "background-packed.js",
        path: path.resolve(__dirname, 'src/js')
    }
    },{
    entry: './src/js/popup.js',
    output: {
        filename: "popup-packed.js",
        path: path.resolve(__dirname, 'src/js')
    }
}];