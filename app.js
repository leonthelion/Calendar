var express			 = require('express')
  , expressResource  = require('express-resource')
  , expressValidator = require('express-validator')
  , http			 = require('http')
  , fs				 = require('fs')
  , pg				 = require('pg')
  , path			 = require('path')
  , email			 = require('emailjs')
  , md5				 = require('./md5')
  , config			 = require('./config');


var app = express();
var conString = config.db.url;
function isInArray(value, array) {
	for (var i=0; i<array.length; i++) {
		if (array[i] === value) {
			return true;
		}
	}
	return false;
}
var emailServer = email.server.connect({
	   user:    config.web.email.user,
	   password:config.web.email.password,
	   host:    config.web.email.host,
	   ssl:     config.web.email.ssl
});

app.engine('.html', require('ejs').__express);

app.configure(function(){
  app.set('port', process.env.PORT || config.web.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(expressValidator);
  app.use(express.cookieParser(config.web.secureKey));
  app.use(express.session());
  app.use(express.csrf());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

process.on('uncaughtException', function(err) {
	console.log(err);
});

function authenticate(req, res, success, dataLocation) {
	var username, password;
	// retrieve username and password from the cookies by default
	// for the login the option to retrieve username and password from the body
	// of the POST request was added, since the cookies are not set yet
	switch (dataLocation) {
	case "body":
		username = req.body.username;
		password = req.body.password;
		break;
	default:	
		username = req.signedCookies.username;
		password = req.signedCookies.password;
	}
	// check if a user with username and password exists in the database
	pg.connect(conString, function(err, client, done){
		var query = client.query("SELECT * FROM users WHERE username = '" + username + "' AND pass = '" + password + "'");
		var users = [];
		query.on('row', function(row) {
			users.push({username : row.username, password : row.pass, validated: row.validated});
		});

		query.on('end', function() {
			done();
			if (users.length === 1) {
				// if the user exists, then call the provided function with the user data
				success(users[0]);
			} else {
				res.redirect('/login');
			}
		});
	});	
}

app.get('/', function(req, res){
	authenticate(req, res, function(){
		res.redirect('/home');
	});
});
app.get('/home', function(req, res){
	authenticate(req, res, function(){
		var data = fs.readFileSync('./views/index.html', 'utf-8');
		res.write(data);
		res.end();
	});
});
app.get('/login', function(req, res){
	res.render('login', {
		token : req.session._csrf
	});
});
app.post('/setCookie', function(req, res){

	req.assert('username', 'invalid username').len(5, 25).notContains(' ').isAlphanumeric();
	req.assert('password', 'invalid password').len(4, 16).notContains(' ').isAlphanumeric();

	var errors = req.validationErrors();
	if (errors) {
		if (errors[0].param === 'username' && errors[errors.length-1].param === 'username') {
			res.redirect('/login?username=' + req.body.username + '&usernameStatus=invalid&passwordStatus=valid');
		} else if (errors[0].param === 'password') {
			res.redirect('/login?username=' + req.body.username + '&usernameStatus=valid&passwordStatus=invalid');
		} else if (errors[0].param === 'username' && errors[errors.length-1].param === 'password') {
			res.redirect('/login?username=' + req.body.username + '&usernameStatus=invalid&passwordStatus=invalid');
		}
	    return;
	}

	authenticate(req, res, function(user){
		if (user.validated === false) {
			res.redirect('/login');
			res.end();
		} else {
			res.cookie('username', req.body.username, {signed : true});
			res.cookie('password', req.body.password, {signed : true});
			res.redirect('/home');
			res.end();
		}
	}, "body");
});
app.get('/destroySession', function(req, res){
	req.session.destroy();
	res.clearCookie('username');
	res.clearCookie('password');
	res.redirect('/');
	res.end();
});
app.get('/register', function(req, res){
	res.render('register', {
		token : req.session._csrf
	});
});
app.post('/signUp', function(req, res){
	pg.connect(conString, function(err, client, done){
		var query = client.query("INSERT INTO users (username, email, pass, validated) VALUES ('" + req.body.username + "', '" + req.body.email + "', '" + req.body.password + "', false)");
		query.on('end', function(row){
			done();
			res.end();
		});
	});
});
app.post('/sendemail', function(req, res){
	emailServer.send({
		text:    "Thank you for registering,\nclick on the link below to validate your email address. Afterwards you will be able to log in and use the calendar application.\nhttp://localhost:3000/", 
		from:    "Calendar App <email.calendar.app@gmail.com>", 
		to:      req.body.username + " <" + req.body.email + ">",
		subject: "EMail Validation"
	}, function(err, message){
		console.log(err || message);
	});
	res.end();
});
app.post('/addEvent', function(req, res){

	pg.connect(conString, function(err, client, done){
		var id;
		var query = client.query("SELECT id FROM users WHERE username = '" + req.signedCookies.username + "' AND pass = '" + req.signedCookies.password + "'");
		query.on('row', function(row){
			id = row.id;
		});
		query.on('end', function(){
			query = client.query("INSERT INTO calendar (title, description, start_date, end_date, start_time, end_time, userid) VALUES ('" + req.body.title + "', '" + req.body.description + "', '" + req.body.start_date + "', '" + req.body.end_date + "', '" + req.body.start_time + "', '" + req.body.end_time + "', " + id + ")");
		});
		done();
	});

	console.log('event created');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end();
});
app.get('/getCSRFToken', function(req, res){
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.write(JSON.stringify({ token: req.session._csrf }));
	res.end();
});
app.get('/getEvents', function(req, res){
	console.log("/getEvents");
	pg.connect(conString, function(err, client, done){
		var query = client.query("SELECT * FROM users WHERE username = '" + req.signedCookies.username + "' AND pass = '" + req.signedCookies.password + "'");
		users = [];
		query.on('row', function(row) {
			users.push({id : row.id, username : row.username, password : row.pass});
		});

		query.on('end', function() {
			done();
			if (users.length === 1) {
				pg.connect(conString, function(err, client, done){
					console.log('test');
					res.writeHead(200, {'Content-Type' : 'application/json'});
					console.log(JSON.stringify(users[0]));
					var query = client.query('SELECT * FROM calendar WHERE userid = ' + users[0].id);
					var response = [];
					query.on('row', function(row) {
						response.push({ id : row.id, title : row.title, description : row.description, start_date : row.start_date, end_date : row.end_date, start_time : row.start_time, end_time : row.end_time, allDay : row.allday});
					});

					query.on('end', function() {
						res.write(JSON.stringify(response));
						done();
						res.end();
					});
				});
			} else {
				res.redirect('/login');
			}
		});
	});
});
app.post('/updateEvent', function(req, res){

	pg.connect(conString, function(err, client, done){
		var query = client.query("UPDATE calendar SET title='" + req.body.newTitle + "', description='" + req.body.newDescription + "', start_date='" + req.body.newStart_date + "', end_date='" + req.body.newEnd_date + "', start_time='" + req.body.newStart_time + "', end_time='" + req.body.newEnd_time + "' WHERE id=" + req.body.id);
		done();
	});

	console.log('event updated');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end();
});
app.post('/delEvent', function(req, res){

	pg.connect(conString, function(err, client, done){
		var query = client.query("DELETE FROM calendar WHERE id = " + req.body.id);
		query.on('end', function(){
			done();
		});
	});

	console.log('event removed');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end();
});
app.all('*', function(req, res) {
	res.render('error/404');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
