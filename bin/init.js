var readline = require("readline");
var util = require("util");
var fs = require("fs");

exports.main = function(argv) {
	
	var rl = readline.createInterface({input: process.stdin, output: process.stdout, completer: null});
	
	var name, authorName, authorURL, description, docsURL, version;
	
	rl.question("Project Name:  ", function(answer) {
		name = answer;
		rl.question("Project Description:  ", function(answer) {
			description = answer;
			rl.question("Author Name:  ", function(answer) {
				authorName = answer;
				rl.question("Author URL:  ", function(answer) {
					authorURL = answer;
					rl.question("Publish URL:  ", function(answer) {
						docsURL = answer;
						rl.question("Project Version:  ", function(answer) {
							version = answer;
							rl.close();
							
							var json = 
								{
									"project": name,
									"description": description,
									"author": {
										"name": authorName,
										"url": authorURL	
									},
									"version": version,
									"docs_url": docsURL
								}
							;
							writeJSON(json)
							
						});
					});
				});
			});
		});
	});
};

function writeJSON(json) {

	json = util.inspect(json, {showHidden: false, depth: null});

	fs.writeFile("apidata.json", json, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("apidata.json successfully created.");
		}
	});
}





