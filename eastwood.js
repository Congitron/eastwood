"use strict";

module.exports = function(config) {
	var website = require('./website.js'),
		logger = require('./logger.js');

	Utilities = require('./utilities.js');
	Logger = new logger();

	var websites = { };
	var domains = config.domains;
	for (var key in domains) {
	    if (domains.hasOwnProperty(key)) {
	    	var siteFolder = domains[key].folder;

	    	if (websites.hasOwnProperty(siteFolder)) { continue; }

	   		var site = new website(siteFolder);
	   		websites[siteFolder] = site;
	    }
	}

	// http
	var http = require('http');
	var port = 80;
	http.createServer(function (request, response) {
		try {
			var host = request.headers.host;

			if (domains[host]) {
				if (domains[host].https == 'true' && domains[host].httpsRedirect == 'true') {
					response.writeHead(301, { 'Content-Type': 'text/html', 'Location': 'https://' + request.headers.host + '/' });
					response.end('');
					return;
				}

				var site = domains[host].folder;
				if (websites[site]) { websites[site].requestHandler.handleRequest(request, response); }
			}

			else if (domains.default && websites[domains.default]) { websites[domains.default].requestHandler.handleRequest(request, response); }
			else {
				response.writeHead(404, { 'Content-Type': 'text/html' });
				response.end('<html><body><h1>404</h1><h1>Eh, I\'m sure it\'s around here somewhere...</h1></body></html>');
			}
		}
		catch (ex) { Logger.log('Exception in http server: ' + ex); }
	}).listen(port);
	Logger.log('Eastwood server http listening on ' + port);


	// https
	if (!config.https || !config.https.key || !config.https.cert) {
		return;
	}

	var https = require('https');
	var fs = require('fs');
	var httpsPort = 443;
	var options = {
	  key: fs.readFileSync('/etc/ssl/private/mywebsite.com.key'),
	  cert: fs.readFileSync('/etc/ssl/certs/mywebsite.com.crt')
	};

	https.createServer(options, function (request, response) {
		try {
			var host = request.headers.host;

			if (!domains[host].https) {
				response.writeHead(200, { 'Content-Type': 'text/html' });
				response.end('<html><body><h1>404</h1><h1>HTTPS is not supported for this site!</h1></body></html>');
				return;
			}

			var site = domains[host].folder;
			if (websites[site]) { websites[site].requestHandler.handleRequest(request, response); }
			else if (websites[domains.default]) { websites[domains.default].requestHandler.handleRequest(request, response); }
			else {
				response.writeHead(404, { 'Content-Type': 'text/html' });
				response.end('<html><body><h1>404</h1><h1>Eh, I\'m sure it\'s around here somewhere...</h1></body></html>');
			}
		}
		catch (ex) {
			Logger.log('Exception in https server: ' + ex);
			Logger.log('host: ' + request.headers.host);
		}
	}).listen(httpsPort);
	Logger.log('Eastwood server https listening on ' + httpsPort);
};
