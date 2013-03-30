var express = require('express')
  , lang = require('./lang')
  , http = require('http')
  , fs = require('fs')
  , pg = require('pg')
  , path = require('path');
var sys = require('sys');


var app = express();
var conString = "postgres://calendar:asdf@localhost:5432/calendar";
//postgres://user:password@host:port/database
//var client = new pg.Client(conString);

app.engine('.html', require('ejs').__express);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res, next){
	  res.status(404);
	  res.writeHead(404, {'Content-Type' : 'text/html'});
	  var data = fs.readFileSync('./views/error/404.html', 'utf-8', function(err, data){
		  if (err) throw err;
		  return console.log(data);
	  });
	  res.write(data);
	  res.end();
  });
  app.use(function(req, res, next){
	  res.status(500);
	  res.writeHead(500, {'Content-Type' : 'text/html'});
	  var data = fs.readFileSync('./views/error/500.html', 'utf-8', function(err, data){
		  if (err) throw err;
		  return console.log(data);
	  });
	  res.write(data);
	  res.end();
  });
  app.use(function(req, res, next){
	  res.status(401);
	  res.writeHead(401, {'Content-Type' : 'text/html'});
	  var data = fs.readFileSync('./views/error/401.html', 'utf-8', function(err, data){
		  if (err) throw err;
		  return console.log(data);
	  });
	  res.write(data);
	  res.end();
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

process.on('uncaughtException', function(err) {
	console.log(err);
});

app.get('/', lang.en_gb);
app.get('/de-de', lang.de_de);
app.get('/en-gb', lang.en_gb);
app.post('/addEvent', function(req, res){
	sys.puts(sys.inspect(req.body));
	
	pg.connect(conString, function(err, client, done){
		var query = client.query("INSERT INTO calendar (title, description, start_date, end_date, start_time, end_time) VALUES ('" + req.body.title + "', '" + req.body.description + "', '" + req.body.start_date + "', '" + req.body.end_date + "', '" + req.body.start_time + "', '" + req.body.end_time + "')");
		done();
	});
	
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end();
});
app.get('/getEvents', function(req, res){
	
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
	sys.puts(sys.inspect(req.body));
	
	pg.connect(conString, function(err, client, done){
		var query = client.query("UPDATE calendar SET title='" + req.body.newTitle + "', description='" + req.body.newDescription + "', start_date='" + req.body.newStart_date + "', end_date='" + req.body.newEnd_date + "', start_time='" + req.body.newStart_time + "', end_time='" + req.body.newEnd_time + "' WHERE id=" + req.body.id);
		done();
	});
	
	console.log('event updated');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end();
});
app.post('/delEvent', function(req, res){
	sys.puts(sys.inspect(req.body));
	
	pg.connect(conString, function(err, client, done){
		var query = client.query("DELETE FROM calendar WHERE id = " + req.body.id);
		done();
	});
	
	console.log('event removed');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end();
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});