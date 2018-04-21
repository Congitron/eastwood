"use strict";

module.exports = function (p) {
	var self = this,

	http = require('http'),
	sys = require('sys'),
	http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),

	RequestContext = require('./requestContext.js');

	var logger = require('./logger.js');
	logger = new logger();

	var project = p;
	var urls = require('../../' + project.settings.projectFolder + '/urls.json');

	var controllers = { };
	for (var key in urls) {
	    if (urls.hasOwnProperty(key)) {
	   		var controller = urls[key];
	   		if (controller.search('.js') > 0) {
	        	controllers[key] = require('../../' + project.settings.projectFolder + '/' + project.settings.controllerFolder + '/' + controller);
	    	}
	    }
	}

	self.handleRequest = function (request, response) {
		try {
			var data = '';
			request.on('data', function (chunk) { data += chunk; });
			request.on('end', function () { self.processRequest(request, response, data); });
		}
		catch (ex) { logger.log('exception in requestHandler.handleRequest: ' + ex); }
	};

	self.processRequest = function (request, response, data) {
		try {
			var user = project.sessionManager.isLoggedIn(request);
			var requestContext = new RequestContext(request, response, data, project, user);

			logger.log('requested url: ' + request.url);

			self.processUrl(requestContext.uri, requestContext);
		}
		catch (ex) { logger.log('exception in requestHandler.processRequest: ' + ex); }
	};

	self.processUrl = function (requestedUrl, requestContext) {
		try {
			if (urls[requestedUrl]) {
				var controller = controllers[requestedUrl];

				if (controller && controller[requestContext.request.method]) { controller[requestContext.request.method].apply(requestContext); }

				else { requestContext.renderTemplate(urls[requestedUrl]); }

		    	return;
			}

			//if no url map, check for file
			var filePath = requestContext.settings.projectFolder + requestedUrl;
			fs.exists(filePath, function(exists) {
				if (exists) { requestContext.returnFile(filePath); }
				else {
					// didn't find anything to return, so give a 404
					requestContext.response.writeHead(404, { 'Content-Type': 'text/html' });
					requestContext.response.end('<html><body><h1>404</h1><h1>Eh, I\'m sure it\'s around here somewhere...</h1></body></html>');
				}
			});
		}
		catch (ex) { logger.log('exception in requestHandler.processUrl: ' + ex); }
	};
};
