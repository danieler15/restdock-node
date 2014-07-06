var fs = require("fs");
var http = require("http");
var request = require("request-json");

exports.main = function(argv) {
	
	
	fs.stat("api_description.json", function(err, stat) {
		if (err) {
			console.log("Error: No 'api_description.json' file exists. Run [apidocs makedocs] first.");
			return;
		}
		var apiData = require(process.cwd() + "/api_description.json");
		
		if (argv["verbose"]) {
			console.log("Publish API data: " + apiData);
		}
		
		// Make the http request to the server
		var client = request.newClient('http://localhost:7070/');
        client.post("/upload", apiData, function(err, res, body) {
            if (err) {
                console.log("Error uploading (clientside): " + err);
            }
            else if (!body["success"]) {
                console.log("Error uploading (serverside): " + body["error"]);
            }
            else {
                // success
                console.log("Success uploading docs. You an view them at www.restdock.com/api/" + apiData["apiDock_path"]);
            }    
        });
	});
};