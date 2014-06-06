

// EXTERNAL
var fs = require("fs");
var pathmod = require("path");
var util = require("util");


var apiData = new Array();

exports.main = function(argv) {
	
	var expressObject = argv['express-object'];
	if (!expressObject) {
		console.log("No express-object specified. Assuming it is 'app'");
		console.log("Specificy a value by adding flag --express-object=[value]");
	}
	
	if (argv['f']) {
		handleJSFile(argv['f']);
	}
	else if (argv['d']) {
		walkDirectory(argv['d']);
	}
	else {
		walkDirectory(process.cwd());
	}
	
	//logArray(apiData);	
	var fullData = insertJSONMetaData(apiData);
	writeFullJSONAPIData(fullData);
};



function walkDirectory(dir) {
	var paths = fs.readdirSync(dir);
	
	console.log("Encountered directory with paths: " + paths);
	
	paths.forEach(function(path) {
		var fileStats = fs.lstatSync(path);
		if (fileStats.isDirectory() && path != "node_modules" && path != "bin") {
			walkDirectory(path)
		}
		else if (fileStats.isFile()) {
			if (isJSFile(path)) {
				handleJSFile(path);
			}	
		}
	});	
}

function handleJSFile(path) {
	console.log("Handling .js file:" + path);
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
			console.log(apiPath);
			
			var rest = line.substr(end);
			if (rem.indexOf("function")) {
				// function implementation is here
			}
			else {
				// function implementation is somewhere else
			}
			
			// get endpoint data
			var prev = lines[ln-1];
			var info = "";
			var endpointName = "endpoint.Unknown";
			if (prev.substr(0, 3) === "//@") {
				// get the meta data
				if (prev.split('"').length > 2) {

					// we have an endpoint name
					var openQuote = prev.indexOf('"');
					var endQuote = prev.indexOf('"', openQuote+1);
					endpointName = prev.substr(openQuote+1, endQuote-openQuote-1);
					
					prev.slice(endQuote);
				}
				
				var begin = (prev.indexOf('"', openQuote+1) === -1) ? 4 : prev.indexOf('"', openQuote+1) + 2;
				info = prev.substr(begin);
				
				
			}
			
			var data = new Array();
			data["endpoint_method"] = endpointMethod;
			data["endpoint_path"] = apiPath;
			data['endpoint_name'] = endpointName;
			data['endpoint_info'] = info;
			data['endpoint_parameters'] = new Array();
			
			apiData[endpointName] = data;
			currentEndpoint = endpointName;
		}
		
		/* LOOKING FOR ENDPOINT PARAMETERS */
		else if (line.indexOf(".query.") != -1 || line.indexOf(".params.") != -1 || line.indexOf(".body.") != -1 || line.indexOf(".param(") != -1) {
			
			var param_name;
			
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
			if (indexSemi < indexSpace) {
				param_name = remaining.substr(0, indexSemi);
			}
			else if (indexSpace < indexSemi){
				param_name = remaining.substr(0, indexSpace);
			}
			else {
				param_name = "ERROR**";
			}
			
			// GET THE PARAMETER DESCRIPTION
			var param_description = "";
			var prev = lines[ln-1];
			if (prev.indexOf("//@") != -1) {
				param_description = prev.substr(prev.indexOf("//@") + 4);
			}
			
			var parameterData = {
				"parameter_name": param_name,
				"parameter_description": param_description
			};

			if (currentEndpoint != "") {
				apiData[currentEndpoint]["endpoint_parameters"].push(parameterData);
			}
		}
		
	}
}

function insertJSONMetaData(endpointData) {
	
	var metadata = require(pathmod.join(process.cwd(), "apidata.json"));
	
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
		"api_url": metadata.docs_url,
		"api_endpoints": endpointData
	};
	return fullJSON;
}

function writeFullJSONAPIData(json) {

	json = util.inspect(json, {showHidden: false, depth: null});
	//json = JSON.stringify(json, null, 4);
	console.log(json);
	
	fs.writeFile("apidocs-api_description.json", json, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("File saved successfully.");
		}
	});
}

function logArray(arr) {
	console.log(util.inspect(arr, {showHidden: false, depth: null}));
}

function isJSFile(filename) {
	var p = filename.split(".");
	var ext = p[p.length - 1];
	
	return ext === "js";
}





