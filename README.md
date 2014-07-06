restdock-node
==============

RestDock is a utility that provides automatic documentation generation and hosting for REST APIs. restdock-node is the command line utility provided to generate documentation and host it on the RestDock servers.

## Installation


restdock-node is not yet available for download. Shortly, it will be available via npm.

To download restdock for node, install via npm with:

    npm install restdock

It is recommended that you install restdock globally, so that you can access it from any project:

    npm install -g restdock

## Usage

### Describing Your API

#### Describing Endpoints

In order to automatically generate documentation for your API, you must describe your API routes in your code. restdock uses a syntax somewhat similar to javadoc. For each API endpoint, the path and method will be filled in automatically. There are three fields which you should explicitly describe:

1. identifier (some string unique to each endpoint)
2. description (a basic description of this endpoint)
3. notes (any additional information not in the description)

You define the values in comments before your API endpoint as follows

```js
//@identifer myendpoint_identifier
//@description Here is a description of the endpoint
//@notes Some extra information about the endpoint
app.get("/api/v1/path", function(req, res) {
	// Works just the same with app.post, app.put, and app.delete
	...
})
````
Note: the descriptive comment lines (those containing "//@") must directly precede the API definition. There should be no newlines separating these lines. A sample described API is available in the Samples folder.

#### Describing Parameters

Parameters are defined in much the same way as endpoints. The name of the parameter is filled in automatically, but you must provide:

1. description
2. type (this is only necessary in order to use the try-it-out tool on restdock.com. It should be either "string", "int", or "JSON")

Somewhere in the function definition for you endpoint, you would write:

````js
app.post("/api/v1/add/object", function(req, res) {
	...
	//@description the name of the object to add
	//@type string
	var objectName = req.body.object_name; // Works exactly the same with req.query, req.param, and req.params
	...
})
````

That's it! You don't have to make any changes to the code itself.

If there is an API route you want to be ignored, simply add ````//@ignore```` before the declaration.

#### Init For Use With RestDock

Before you generate the docs, run

    restdock init

It will ask you to fill in some self-explanatory values, and generate a file titled restdock.json (kind of like a package.json file).

#### Generate Documentation

Once you've described your API, you can run
    
    restdock makedocs 

This will create a file called api_description.json that defines data about your API in a way that the server will understand. You might want to read through it and fix/add anything that restdock missed, although in theory no user action is necessary. There is a sample api_description.json file available in the Samples folder.

You can run makedocs with the following options:

````
-f [file]  only scans the specified file for endpoints
-d [directory]  only scans the specified directory for endpoints
-p [prefix string]  if you specify a prefix such as "/api/v1", only API routes prefixed as specified will be documented
--verbose  logs detailed information about the generation process
--dev   *Only use this if you are interested in contributing:* it will produce many logs, and uploads to localhost:7070 rather than the real server.
````

#### Publish!

If everything want alright with the makedocs command, and an api_description.json file exists, you can go ahead and run

    restdock publish

Upon success, you will be given a URL at which you can access automatically generated documentation for your API!

## TODO

There is a lot to be done with restdock. My first priority is to add support for Express 4 routers, so that restdock can identify endpoints that aren't declared explicitly with app.VERB, and generally make restdock work with different ways of declaring routes and parameters.

## License

MIT License

## Credits

RestDock was made by Daniel Ernst in 2014. Please contribute to the project, so your name can be added here!