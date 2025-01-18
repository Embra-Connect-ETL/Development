const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        main: [
            './assets/js/action_buttons.js',
            './assets/js/command_panel.js',
            './assets/js/side_bar.js',
            './assets/js/tabs.js'
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    resolve: {
        alias: {
            'vs': path.resolve(__dirname, 'node_modules/monaco-editor/min/vs')  // Just in case, adjust for local Monaco installs
        }
    },
    plugins: [
        // Ignore editor.js during bundling
        new webpack.IgnorePlugin({
            resourceRegExp: /editor.js$/,
            contextRegExp: /assets\/js/
        })
    ]
};
