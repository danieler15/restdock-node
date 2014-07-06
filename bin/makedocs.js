

// EXTERNAL
var fs = require("fs");
var pathmod = require("path");
var util = require("util");

var markup = "//@";
var validTags = new Array("identifier", "type", "description", "notes", "ignore");
var apiData = {};


var dev;
var verbose;

exports.main = function(argv) {
	
	var expressObject = argv['express-object'];
	if (!expressObject) {
		console.log("No express-object specified. Assuming it is 'app'");
		console.log("Specificy a value by adding flag --express-object=[value]");
	}
	
	dev = argv["dev"];
	verbose = argv["verbose"];
	
	if (argv['f']) {
		handleJSFile(argv['f']);
	}
	else if (argv['d']) {
		walkDirectory(argv['d']);
	}
	else {
		walkDirectory(process.cwd());
	}
	
	var fullData = insertJSONMetaData(apiData);

	console.log("Found " + Object.keys(apiData).length + " endpoints total.");
	
	writeFullJSONAPIData(fullData);
};



function walkDirectory(dir) {
	var paths = fs.readdirSync(dir);
	
	vLog("Encountered directory with paths: " + paths);
	
	for (var i = 0; i < paths.length; i++) {
		var shortPath = paths[i];
		var fullPath = dir + "/" + shortPath;
		
		var fileStats = fs.lstatSync(fullPath);
		if (fileStats.isDirectory() && shortPath != "node_modules" && shortPath != "bin" && shortPath != ".git" && shortPath != "css") {
			walkDirectory(fullPath)
		}
		else if (fileStats.isFile()) {
			if (isJSFile(shortPath)) {
				handleJSFile(fullPath);
			}	
		}
	}	
}

function handleJSFile(path) {
	vLog("Handling .js file: " + path);
	var text = fs.readFileSync(path).toString();
	
	var currentEndpoint = "";
	
	var lines = text.split("\n");
	for (var ln = 0; ln < lines.length; ln++) {
		line = lines[ln];
		
		/* LOOKING FOR ENDPOINTS */
		if (line.indexOf("app.post(") != -1 || line.indexOf("app.get(") != -1 || line.indexOf("app.put(") != -1 || line.indexOf("app.delete(") != -1) {
			
			var paren = line.indexOf("(");
			var endpointMethod = line.substr(line.indexOf(".")+1, paren - line.indexOf(".") - 1);
			
			var start = paren + 2; 
			var rem = line.substr(start);
			
			var end = (rem.indexOf("'") == -1) ? rem.indexOf('"') : rem.indexOf("'");
			var apiPath = rem.substr(0, end);
			
			if (!isValidPath(apiPath)) {
				vLog("ignoring invalid path: " + apiPath);
				continue;
			}
			
			var rest = line.substr(end);
			if (rem.indexOf("function")) {
				// function implementation is here
			}
			else {
				// function implementation is somewhere else
			}
			
			// this is the object with all the endpoint data
			var endpoint = {};
			
			
			var curLineNum = ln - 1;
			var curLine = lines[curLineNum];
			
			if (hasMarkup(lines[curLineNum]) && lines[curLineNum].indexOf("//@ignore") > -1) {
				vLog("Ignoring path:  " + apiPath);
				continue;
			}
			
			console.log("Found API Path: " + apiPath);
		
			while (hasMarkup(curLine)) {
				endpoint[markupKey(curLine)] = markupValue(curLine);
				
				curLineNum--;
				curLine = lines[curLineNum]
			}
			
			endpoint["method"] = endpointMethod;
			endpoint["path"] = apiPath;
			endpoint['parameters'] = [];
			
			var endpointKey = endpoint["identifier"] ? endpoint["identifier"] : endpoint["path"];

			apiData[endpointKey] = endpoint;
			currentEndpoint = endpointKey;
		}
		
		/* LOOKING FOR ENDPOINT PARAMETERS */
		else if (line.indexOf(".query.") != -1 || line.indexOf(".params.") != -1 || line.indexOf(".body.") != -1 || line.indexOf(".param(") != -1) {
			
			var parameter = {};
			
			// which one is it?
			var possibilities = new Array(".query.", ".params.", ".body.", ".param(");
			var which = possibilities[0];
			var num = 0;
			while (line.indexOf(which) == -1) {
				which = possibilities[++num];
			}
			
			// GET THE PARAMETER NAME
			var start = line.indexOf(which) + which.length;
			var remaining = line.substr(start);
			var indexSemi = (remaining.indexOf(";") == -1) ? 2000 : remaining.indexOf(";");
			var indexSpace = (remaining.indexOf(" ") == -1) ? 2000 : remaining.indexOf(" ");
			var indexComma = (remaining.indexOf(",") == -1) ? 2000 : remaining.indexOf(",");
			var indices = new Array(indexSemi, indexSpace, indexComma);
			
			var smallestIndex = smallestInArray(indices);
			if (indexSemi == indexComma && indexSemi == indexSpace) {
				parameter["name"] = "ERROR**";
				eLog("Unable to parse parameter", false);
			}
			else {
				parameter["name"] = remaining.substr(0, smallestIndex)
			}
		
			
			// GET THE PARAMETER DESCRIPTION
			var curLineNum = ln - 1;
			var curLine = lines[curLineNum];
			while (hasMarkup(curLine)) {
				parameter[markupKey(curLine)] = markupValue(curLine);
				
				curLine = lines[--curLineNum];
			}

			if (currentEndpoint != "") {
				apiData[currentEndpoint]["parameters"].push(parameter);
			}
		}
		
	}
}

function insertJSONMetaData(endpointData) {
	
	var metadata = require(pathmod.join(process.cwd(), "apidock.json"));
	
	vLog("restdock metadata: " + arrayContents(metadata));
	
	var fullJSON = {
		"apidocs_info": {
			"apidocs": {
				"author": "Daniel Ernst",
				"link": "github.com/danieler15/apiautodocs"
			},
			"library": "node",
			"generated": new Date()
		},
		"api_name": metadata.project,
		"api_author": metadata.author,
		"api_text_description": metadata.description,
		"api_version": metadata.version,
		"api_base_url": metadata.base_url,
		"apiDock_path": stripSpaces(metadata.project).toLowerCase(),
		"api_endpoints": endpointData
	};
	return fullJSON;
}

function writeFullJSONAPIData(json) {

	json = JSON.stringify(json, null, 3);
	vLog("\n\nFull JSON data:  " + json);
	
	fs.writeFile("api_description.json", json, function(err) {
		if (err) {
			eLog("Error writing to file: " + err, true);
		}
		else {
			console.log("api_description.json saved successfully. Use [restdock publish] to publish.");
		}
	});
}

function stripSpaces(str) {
	return str.replace(/\s+/g, '');
}

function hasMarkup(str) {
	
	var has = (str.indexOf(markup) > -1);
	return has;
}

function markupKey(str) {
	var startOfMarkup = str.indexOf(markup);
	var afterMarkupIndex = startOfMarkup + markup.length;
	var line = str.substr(afterMarkupIndex);
	
	var indexOfFirstSpace = line.indexOf(" ");
	var key = line.substring(0, indexOfFirstSpace);
	var value = line.substr(indexOfFirstSpace+1);
	
	if (validTags.indexOf(key) < 0) {
		wLog("Invalid tag in markup: @" + key);
	}
	
	return key;
}

function markupValue(str) {
	var startOfMarkup = str.indexOf(markup);
	var afterMarkupIndex = startOfMarkup + markup.length;
	var line = str.substr(afterMarkupIndex);
	
	var indexOfFirstSpace = line.indexOf(" ");
	var key = line.substring(0, indexOfFirstSpace);
	var value = line.substr(indexOfFirstSpace+1);
		
	return value;	
}

function smallestInArray(arr) {
	var smallest = arr[0];
	for (var i = 1; i < arr.length; i++) {
		if (arr[i] < smallest) {
			smallest = arr[i];
		}
	}
	return smallest;
}

function isValidPath(str) {
	//TODO: improve
	return str.indexOf("/") > -1;
}

function logArray(arr) {
	console.log(arrayContents(arr));
}

function arrayContents(arr) {
	return util.inspect(arr, {showHidden: false, depth: null})
}

function isJSFile(filename) {
	var p = filename.split(".");
	var ext = p[p.length - 1];
	
	return ext === "js";
}

//warnLog
function wLog(str) {
	console.log("WARN: " + str);
}

//errorLog
function eLog(str, exit) {
	console.log("**ERROR: " + str);
	if (exit) {
		console.log("restdock execution stopped.");
	}
	else {
		console.log("restdock execution continuing");
	}
}

//devLog
function dLog(str) {
	if (dev) {
		console.log(str);
	}
}

//verboseLog
function vLog(str) {
	if (verbose) {
		console.log(str);
	}
}




