var fs = require("fs");
var http = require("http");
var request = require("request-json");
var constants = require("./constants");

exports.main = function(argv) {
	
	
	fs.stat("api_description.json", function(err, stat) {
		if (err) {
			console.log("Error: No 'api_description.json' file exists. Run [restdock makedocs] first.");
			return;
		}
		var apiData = require(process.cwd() + "/api_description.json");
		
		if (argv["verbose"]) {
			console.log("Publish API data: " + apiData);
		}
		
		// Make the http request to the server
		var host = argv["dev"] ? constants.devServerRoot : constants.serverRoot;
		
		var client = request.newClient(host);
        client.post("/upload", apiData, function(err, res, body) {
            if (err) {
                console.log("Error uploading (clientside): " + err);
            }
			else if (body["code"] == constants.kResponseCodeNameTaken) {
				console.log("Error uploading, this API name is already taken.");
			}
            else if (!body["code"] == 200) {
                console.log("Error uploading (serverside): " + body["error"]);
            }
            else {
                // success
                console.log("Success uploading docs. You an view them at " + host + "/api/" + apiData["apiDock_path"]);
            }    
        });
	});
};