var express			 = require('express')
  , expressResource  = require('express-resource')
  , expressValidator = require('express-validator')
  , http			 = require('http')
  , fs				 = require('fs')
  , pg				 = require('pg')
  , path			 = require('path');


var app = express();
var conString = "postgres://calendar:asdf@localhost:5432/calendar";
//postgres://user:password@host:port/database
// var client = new pg.Client(conStringLogin);
function isInArray(value, array) {
	for (var i=0; i<array.length; i++) {
		if (array[i] === value) {
			return true;
		}
	}
	return false;
}

app.engine('.html', require('ejs').__express);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser('secret'));
  app.use(express.session());
  app.use(express.query());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
//  app.use(function(req, res, next){
//	  if(res.status(401)) {
//		  res.writeHead(401, {'Content-Type' : 'text/html'});
//		  var data = fs.readFileSync('./views/error/401.html', 'utf-8');
//		  res.write(data);
//		  res.end();
//	  } else if(res.status(404)) {
//		  res.writeHead(404, {'Content-Type' : 'text/html'});
//		  var data = fs.readFileSync('./views/error/404.html', 'utf-8');
//		  res.write(data);
//		  res.end();
//	  } else if(res.status(500)) {
//		  res.writeHead(500, {'Content-Type' : 'text/html'});
//		  var data = fs.readFileSync('./views/error/500.html', 'utf-8');
//		  res.write(data);
//		  res.end();
//	  }
//  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

process.on('uncaughtException', function(err) {
	console.log(err);
});

app.get('/', function(req, res){
	pg.connect(conString, function(err, client, done){
		var query = client.query("SELECT * FROM users WHERE username = '" + req.cookies.username + "' AND pass = '" + req.cookies.password + "'");
		console.log(req.signedCookies);
		var users = [];
		query.on('row', function(row) {
			users.push({username : row.username, password : row.pass});
		});
		
		query.on('end', function() {
			done();
			if (users.length === 1) {
				res.redirect('/home');
			} else {
				res.redirect('/login');
			}
		});
	});
});
app.get('/home', function(req, res){
	pg.connect(conString, function(err, client, done){
		var query = client.query("SELECT * FROM users WHERE username = '" + req.signedCookies.username + "' AND pass = '" + req.signedCookies.password + "'");
		console.log(req.signedCookies);
		var users = [];
		query.on('row', function(row) {
			users.push({username : row.username, password : row.pass});
		});
		
		query.on('end', function() {
			done();
			if (users.length === 1) {
				var data = fs.readFileSync('./views/index.html', 'utf-8');
				res.writeHead(200, {'Content-Type' : 'text/html'});
				res.write(data);
				res.end();
			} else {
				res.redirect('/login');
			}
		});
	});
});
app.get('/login', function(req, res){
	var data = fs.readFileSync('./views/login.html', 'utf-8');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.write(data);
	res.end();
});
app.post('/setCookie', function(req, res){
	pg.connect(conString, function(err, client, done){
		console.log(req.body.username);
		console.log(req.body.password);
		var query = client.query("SELECT * FROM users WHERE username = '" + req.body.username + "' AND pass = '" + req.body.password + "'");
		var users = [];
		query.on('row', function(row) {
			users.push({username : row.username, password : row.pass});
		});
		console.log(users);
		query.on('end', function() {
			done();
			if (users.length === 0) {
				res.redirect('/login');
				res.end();
			} else {
//				res.setHeader('Set-Cookie', 'username=' + req.body.username, {signed : true});
//				res.setHeader('Set-Cookie', 'password=' + req.body.password, {signed : true});
				res.cookie('username', req.body.username, {signed : true});
				res.cookie('password', req.body.password, {signed : true});
				res.redirect('/home');
				res.end();
			}
		});
	});
});
app.post('/destroySession', function(req, res){
	res.clearCookie('username');
	res.clearCookie('password');
	res.redirect('/');
	res.end();
});
app.post('/addEvent', function(req, res){
	
	pg.connect(conString, function(err, client, done){
		var query = client.query("INSERT INTO calendar (title, description, start_date, end_date, start_time, end_time) VALUES ('" + req.body.title + "', '" + req.body.description + "', '" + req.body.start_date + "', '" + req.body.end_date + "', '" + req.body.start_time + "', '" + req.body.end_time + "')");
		done();
	});
	
	console.log('event created');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end();
});
app.post('/getEvents', function(req, res){
	
	pg.connect(conString, function(err, client, done){
		res.writeHead(200, {'Content-Type' : 'application/json'});
		var query = client.query('SELECT * FROM calendar');
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
		done();
	});
	
	console.log('event removed');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end();
});
app.all('*', function(req, res) {
	res.writeHead(404, {'Content-Type' : 'text/html'});
	res.write(fs.readFileSync('./views/error/404.html', 'utf-8'));
	res.end();
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});