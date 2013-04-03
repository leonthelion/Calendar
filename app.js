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
function isInArray(value, array) {
	for (var i=0; i<array.length; i++) {
		if (array[i] === value) {
			return true;
		}
	}
	return false;
}
var key = 'MIICXAIBAAKBgQChm75ObmHa7tjxfNHsJ8orMACCjurZbQDqpJFPXiYXbTlOhP+LDi8cl1WmK4Y9vKNgMSAu3tCvy3kb8qGh/yCLYHEVnz678dM2K8yRW7uc/4VAztwkYOTfoydwmdA1C1og7CiiQtvkwoTxwv3kGlFb18whJee2YOBQ0B6GXGFy6wIDAQABAoGABYfyDHckrDyOej1eZem6tp2u9sjzarubU2yMeJ3tSdH4KyLMKDM1E5JuYQCOWKCTKuCjjFcd51Zcb8NvGr9DmtOjJpBLKmrDrKzg2XLGipAIsgMLG0TpUzAuMhj1D8bNmLu/CPO+RndEx3mF85u531fr5KtypDYv8R4ogyyCJnkCQQDU8CKKgSLaRLUz3GnBl9HSsq053sTdGq5fXXBBnaWqdjvmbEDRgtIlk93B4Mu/dQJ9pDWalD17kDtyK6Tx+msdAkEAwkpByDA4bfHdAriI4tf4iMjBfkOHdZHMp/Qy406qySpA3DfK7UUwkWLl3DM4zjG2ZNt/a+dtY0xIQkG1W6RvpwJBAJEW+oIjUYsly84Ffm3xs398Tbojx0HcvzmtoiKjd1E59MChvFzFZclDApPrRwkygjr326pzHZ2G/mphwKc8eSUCQDKIB6XeTL7jmdy8S/Xbv+src4+4VoHQgs7n51hRPIAHekkMRb4CMciOVUQ5Gjwel9aRdAmHbl7WFzEMT/Pex58CQCtIeFjbrzUq8hWkDP35HlnLjHRCfeFER+4xLaFsPedjIaPmfnKEd8oHNh3WmptHFPsgOWpG8+ygOYpt7FRuxYA=';
function getEvents(req, res) {
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
}

app.engine('.html', require('ejs').__express);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(expressValidator);
  app.use(express.cookieParser(key));
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

app.get('/', function(req, res){
	pg.connect(conString, function(err, client, done){
		var query = client.query("SELECT * FROM users WHERE username = '" + req.signedCookies.username + "' AND pass = '" + req.signedCookies.password + "'");
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
		var users = [];
		query.on('row', function(row) {
			users.push({username : row.username, password : row.pass});
		});
		
		query.on('end', function() {
			done();
			if (users.length === 1) {
				var data = fs.readFileSync('./views/index.html', 'utf-8');
				res.write(data);
				res.end();
			} else {
				res.redirect('/login');
			}
		});
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
			res.redirect('/login?username=' + req.body.username + '&password=' + req.body.password + '&usernameStatus=invalid&passwordStatus=valid');
		} else if (errors[0].param === 'password') {
			res.redirect('/login?username=' + req.body.username + '&password=' + req.body.password + '&usernameStatus=valid&passwordStatus=invalid');
		} else if (errors[0].param === 'username' && errors[errors.length-1].param === 'password') {
			res.redirect('/login?username=' + req.body.username + '&password=' + req.body.password + '&usernameStatus=invalid&passwordStatus=invalid');
		}
	    return;
	}
	
	pg.connect(conString, function(err, client, done){
		var query = client.query("SELECT * FROM users WHERE username = '" + req.body.username + "' AND pass = '" + req.body.password + "'");
		var users = [];
		query.on('row', function(row) {
			users.push({username : row.username, password : row.pass});
		});
		query.on('end', function() {
			done();
			if (users.length === 0) {
				res.redirect('/login');
				res.end();
			} else {
				res.cookie('username', req.body.username, {signed : true});
				res.cookie('password', req.body.password, {signed : true});
				res.redirect('/home');
				res.end();
			}
		});
	});
});
app.get('/destroySession', function(req, res){
	req.session.destroy();
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
app.get('/getCSRFToken', function(req, res){
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.write(JSON.stringify({ token: req.session._csrf }));
	res.end();
});
app.get('/getEvents', function(req, res){
	console.log("/getEvents");
	pg.connect(conString, function(err, client, done){
		var query = client.query("SELECT * FROM users WHERE username = '" + req.signedCookies.username + "' AND pass = '" + req.signedCookies.password + "'");
		var users = [];
		query.on('row', function(row) {
			users.push({username : row.username, password : row.pass});
		});
		
		query.on('end', function() {
			done();
			if (users.length === 1) {
				access = true;
			} else {
				res.redirect('/login');
			}
		});
	});
	setTimeout(function(){
		if (access===true) {
			getEvents(req, res);
		}
	}, 250);
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