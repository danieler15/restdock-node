#!/usr/local/bin/node

// EXTERNAL
var fs = require("fs");
var pathmod = require("path");
var util = require("util");
var argv = require('minimist')(process.argv.slice(2));

// INTERNAL MODULES
var makedocs = require("./makedocs.js");
var publish = require("./publish.js");
var init = require("./init.js");

console.log("*****************\n");

if (argv["verbose"] || argv["dev"]) {
	console.log("Argv: " + util.inspect(argv, {showHidden: false, depth: null}));
}



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

else if (commands.length == 0 && argv["help"] == true) {
	console.log("Welcome to restdock, a tool for automatic API documentation and hosting.");
	console.log("For restdock to work, you must be using node.js with Express.");
	console.log("Use [restdock init] to setup your project.\n");
	console.log("Use [restdock makedocs] to generate a JSON representation of your API.\n");
	console.log("Use [restdock publish] to publish your documentation to www.restdock.com\n\n");
	console.log("See www.github.com/danieler15/restdock-node for a full tutorial.");
}

else {
	console.log('No such command: "' + command + "\n");
	console.log("Type restdock --help for usage information"); 
}


function invalid(msg) {
	console.log("Invalid usage: " + msg);
	console.log("Type restdock --help for usage information");
}







