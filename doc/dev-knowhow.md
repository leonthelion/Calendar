Dev Tips & Tricks
================================

Debugging
-------------------------

	npm install -g node-inspector

Start app in debug modus:

	node --debug-brk app.js

Start node-inspector in other shell window

	node-inspector
	
open browser window for debugging, link is given by node-inspector

	http://localhost:8080/debug?port=5858

open browser window for the application


Use NODE_ENV to set the application's "mode"
---------------------------------------------

A common Connect convention is to use the `NODE_ENV` environment variable (`process.env.NODE_ENV`) 
to toggle the behavior between different server environments, like "production" and "development". 

	var env = process.env.NODE_ENV || 'development';


Setting cookies on the server-side
-----------------------------------

The cookieParser() middleware doesn't provide any helpers for setting outgoing cookies. 
For this, you should use the `res.setHeader()` function with "Set-Cookie" as the header name. 
Connect patches Node's default `res.setHeader()` function to special-case the "Set-Cookie" headers, 
so that it "just works" as you would expect it to. 