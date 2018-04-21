"use strict";

module.exports = function(req, res, dat, proj, usr) {
	this.request = req;

	var urlParts = require('url').parse(req.url, true);
	this.query = urlParts.query;
	this.uri = urlParts.pathname;

	this.response = res;
	this.data = dat;
	this.settings = proj.settings;
	this.dao = proj.dao;
	this.orm = proj.orm;
	this.user = usr;
	this.sessionManager = proj.sessionManager;

	// var Utilities = require('./utilities.js');
	// this.utilities = new Utilities();

	var TemplateParser = require('./templateParser.js');

	this.renderTemplate = function (templatePath) {
		try {
			var pagePath = this.settings.projectFolder + '/' + this.settings.viewFolder + '/' + templatePath;
			var me = this;

			require('fs').readFile(pagePath, 'utf-8', function (err, text) { me.renderTemplateString.apply(me, [text]);	});
		}
		catch (ex) { Logger.log('exception in requestContext.renderTemplate: ' + ex); }
	};

	this.renderTemplateString = function (template) {
		try {
			var parser = new TemplateParser();
			var parsedText = parser.processTemplate.apply(this, [template]);

			this.response.setHeader('Content-Type', 'text/html');
			this.response.end(parsedText);
		}
		catch (ex) { Logger.log('exception in requestContext.renderTemplateString: ' + ex); }
	};

	this.returnFile = function (filePath) {
		try {
			var me = this;

			require('fs').readFile(filePath, 'binary', function(err, file) {
				if (err) {
					me.response.writeHead(500, { 'Content-Type': 'text/plain' });
					me.response.end(err + 'n');
					return;
				}

				if (filePath.endsWith('.svg')) { me.response.writeHead(200, { 'Content-Type': 'image/svg+xml' }); }
				else if (filePath.endsWith('.css')) { me.response.writeHead(200, { 'Content-Type': 'text/css' }); }
				else if (filePath.endsWith('.exe')) { me.response.writeHead(200, { 'Content-Type': 'application/octet-stream' }); }
				else { me.response.writeHead(200); }

				me.response.end(file, 'binary');
				return;
			});
		}
		catch (ex) { Logger.log('exception in requestContext.returnFile: ' + ex); }
	};

	this.getContentType = function (filePath) {
		try {
			if (filePath.endsWith('.svg')) { return 'image/svg+xml'; }
			else if (filePath.endsWith('.css')) { return 'text/css'; }
			return null;
		}
		catch (ex) { Logger.log('exception in requestContext.getContentType: ' + ex); }
	};
};
