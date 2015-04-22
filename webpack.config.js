var webpack = require("webpack");
var glob = require("glob")

var path = require("path");


var staticPath = path.join(__dirname , "static");


var array  = glob.sync( "static/**/load.*.js") ;

var entryMap = {};
for(var i = 0 ; i <array.length ; i ++){
var filePath = array[i];
var entryName = filePath.match(/load\.(.+)\.js/i , filePath )[1];
    entryMap["entry." + entryName + ""] = filePath.replace("static" , ".");
}

entryMap["common"] =  [
    "underscore" ,
    "./lib/underscore/underscore.ext" ,
    "jquery",
    "expose?moment!moment",
    "./lib/bootstrap/bootstrap",
    "./lib/bootstrap/bootstrap-datetimepicker.min"
]

module.exports = {
    context: staticPath,
    entry: entryMap,

    output: {
        path:  path.join(__dirname , "static"),
        filename: './[name].js'
    },
    resolve: {
        modulesDirectories : [   'node_modules' ,  path.join( __dirname, "static/common" ) ,  path.join( __dirname, "static/lib" ) , staticPath]
    },
    module : {
        loaders: [
            { test: /\.css/, loader: "css!style" },
            { test: /\.ejs/, loader: "ejs" },
        ]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin( 'common' , 'common.js' ) ,
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            _: 'underscore'
        })
    ]

};