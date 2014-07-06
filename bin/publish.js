var fs = require("fs");
var http = require("http");
var request = require("request-json");

exports.main = function(argv) {
	
	
	fs.stat("api_description.json", function(err, stat) {
		if (err) {
			console.log("No 'api_description.json' file exists. Run [apidocs makedocs] first.");
			return;
		}
		var apiData = require("../api_description.json");
		console.log(apiData);
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
                console.log("success uploading");
            }    
        });
	});
};