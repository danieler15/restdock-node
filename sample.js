var x = 2;

var y = 34;
var q = x + y;

//@ "endpoint.make_api" Make something with the API
app.post('/api/v2/login', function(req,res) {
	
	//@ user username
	var username = req.body.username; 
	//@ user password
	var pass = req.body.password;
	//@ This is the id that you use to identify yourself to the database
	var uid = req.body.uid;
	
	
});

//@ Test this API implementation
app.get('/api/v2/test', function(req,res) {
	
});