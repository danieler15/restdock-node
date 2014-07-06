var readline = require("readline");
var util = require("util");
var fs = require("fs");

exports.main = function(argv) {
	
	var rl = readline.createInterface({input: process.stdin, output: process.stdout, completer: null});
	
	var name, authorName, authorURL, description, baseURL, version;
	
	rl.question("Project Name:  ", function(answer) {
		name = answer;
		rl.question("Project Description:  ", function(answer) {
			description = answer;
			rl.question("Author Name:  ", function(answer) {
				authorName = answer;
				rl.question("Author Website:  ", function(answer) {
					authorURL = answer;
					rl.question("API Base URL:  ", function(answer) {
						baseURL = answer;
						rl.question("Project Version:  ", function(answer) {
							version = answer;
							rl.close();
							
							var json = 
								{
									"project": name,
									"description": description,
									"author": {
										"name": authorName,
										"website": authorURL
											
									},
									"version": version,
									"base_url": docsURL
								}
							;
							writeJSONToFile(json)
							
						});
					});
				});
			});
		});
	});
};

function writeJSONToFile(json) {

	json = JSON.stringify(json, null, 3);
	
//	if (fs.existsSync("apidata.json")) {
//		fs.unlinkSync("apidata.json");
//	}

	fs.writeFile("apidock.json", json, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("apidata.json successfully created.");
		}
	});
}





