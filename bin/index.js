#!/usr/local/bin/node

// EXTERNAL
var fs = require("fs");
var pathmod = require("path");
var argv = require('minimist')(process.argv.slice(2));

// INTERNAL MODULES
var makedocs = require("./makedocs.js");
var publish = require("./publish.js");
var init = require("./init.js");

console.log("*****************\n");
console.log(argv);


var commands = argv["_"];
if (commands.length > 1) {
	invalid("More than one command issued.");
}
var command = commands[0];


if (command === "makedocs") {
	makedocs.main(argv);
	
}
else if (command === "publish") {
	publish.main(argv);	
}
else if (command === "init") {
	init.main(argv);
}


function invalid(msg) {
	console.log("Invalid usage: " + msg);
	console.log("Usage: apidocs [ init | makedocs | publish | help ] [ -f (file) -d (directory) -v]");
	console.log("Type [apidocs help] for more info.");
}







