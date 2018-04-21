"use strict";

module.exports = function () {
	var self = this,

	path = require('path'),
	fs = require('fs'),

	myself = require('./templateParser.js'),
	utilities = require('./utilities.js');

	var logger = require('./logger.js');
  logger = new logger();

	//self.baseTemplate = null; //these get added on the fly if the template extends a base template, but they're here for reference
	//self.baseBlock = null;

	self.processTemplate = function (template) {
		try {
			var matches = template.match(/{:(.*):}/g); //single line tags using {: whatever :} syntax
			if (matches) {
				for (var m = 0; m < matches.length; m++) {
					var match = matches[m];
					var tag = match.replace(/{:(.*):}/g,'$1');
				    tag = tag.trim();
				    var replacement = self.processTag.apply(this, [template, match, tag]);
				    template = template.replace(match, replacement);
				}
			}

			var blockRegex = /{!([^!}]*)!}([\s\S]*?){\/!}/g; //multiline tags using {! whatever !} ... {/!} syntax
			var blockMatch;

			while (blockMatch = blockRegex.exec(template)) {
				var replacement = self.processMultiline.apply(this, [template, blockMatch]);
				template = template.replace(blockMatch[0].toString(), replacement);
			}

			var extended = false;
			if (self.baseTemplate && self.baseBlock) {
				matches = self.baseTemplate.match(/{:(.*):}/g);

				if (!matches) { return template; } //if we can't find a block tag in the base template just return this one without it

				for (var m = 0; m < matches.length; m++) {
				    var match = matches[m];
				    var tag = match.replace(/{:(.*):}/g,'$1');
				    tag = tag.trim();
				    var action = tag.split(' ')[0];

				    if (action != 'block') { continue; }

				    var attributes = utilities.parseAttributes(tag);
				    if (attributes.name == self.baseBlock) {
				    	self.baseTemplate = self.baseTemplate.replace(match, template);
				    	extended = true;
				    }
				}
			}

			if (extended) { return self.baseTemplate; }
			return template;
		}
		catch (ex) { logger.log('exception in templateParser.processTemplate: ' + ex); }
	};

	self.processTag = function (template, match, tag) {
		try {
			var action = tag.split(' ')[0];
			var attributes = utilities.parseAttributes(tag);

			if (action == 'static') { return self.doStatic.apply(this, [attributes]); }
			if (action == 'extend') { return self.doExtend.apply(this, [attributes]); }
			if (action == 'include') { return self.doInclude.apply(this, [attributes]); }
			if (action == 'block') { return match; }
			if (action == 'value') { return self.doValue.apply(this, [attributes]); }
			if (action == 'function') { return self.doFunction.apply(this, [attributes]); }

			return ''; //if we can't process it, just remove it
		}
		catch (ex) { logger.log('exception in templateParser.processTag: ' + ex); }
	};

	self.doStatic = function (attributes) {
		try {
			if (!attributes.path) { return ''; }

			// can be used like <img src="{: static path="images/mypic.jpg" id="mypic" :}" >
			// or {: static tag="img" path="images/mypic.jpg" id="mypic" :}
			// id is optional

			var staticPath = path.join(this.settings.staticFolder, attributes.path);
			if (!staticPath) { return ''; }

			if (attributes.tag) {
				if (attributes.tag == 'img') {
					var result = '<img src="' + staticPath + '" '
					if (attributes.id) { result += 'id="' + attributes.id + '" '; }
					result += '>';
					return result;
				}
			}

			return staticPath;
		}
		catch (ex) { logger.log('exception in templateParser.doStatic: ' + ex); }
	};

	self.doExtend = function (attributes) {
		try {
			if (!attributes.path || !attributes.block) { return ''; }

			var filename = this.settings.projectFolder + '/' + this.settings.viewFolder + '/' + attributes.path;
			var buffer = fs.readFileSync(filename, 'utf-8');
			var base = null;
			if (buffer) {
				var parser = new myself();
				base = parser.processTemplate.apply(this, [buffer]);
			}

			self.baseTemplate = base; // set the base, which we will insert the extending template into after fully processing it
			self.baseBlock = attributes.block; // this is where we will insert in the base template
			return ''; // we don't insert the base template into the extending template, it's vice versa..
		}
		catch (ex) { logger.log('exception in templateParser.doExtend: ' + ex); }
	};

	self.doInclude = function (attributes) {
		try {
			if (!attributes.path) { return ''; }

			var filename = this.settings.projectFolder + '/' + this.settings.viewFolder + '/' + attributes.path;

			var buffer = fs.readFileSync(filename, 'utf-8');
			var insert = '';
			if (buffer) {
				var parser = new myself();
				insert = parser.processTemplate.apply(this, [buffer]);
			}

			return insert;
		}
		catch (ex) { logger.log('exception in templateParser.doInclude: ' + ex); }
	};

	self.doValue = function (attributes) {
		try {
			if (!attributes.name) { return ''; }

			var templateValues = require('../../' + this.settings.projectFolder + '/templateValues.json');
			var value = templateValues[attributes.name];
			return (value) ? value : '';
		}
		catch (ex) { logger.log('exception in templateParser.doValue: ' + ex); }
	};

	self.doFunction = function (attributes) {
		try {
			if (!attributes.name) { return ''; }

			var templateFunctions = require('../../' + this.settings.projectFolder + '/templateFunctions.js');
			var func = templateFunctions[attributes.name];
			if (!func) { return ''; }

			var result = func(attributes);
			return (result) ? result : '';
		}
		catch (ex) { logger.log('exception in templateParser.doFunction: ' + ex); }
	};

	self.processMultiline = function (template, match) {
		try {
			var functionTag = match[1];
			functionTag = functionTag.trim();
			var functionName = functionTag.split(' ')[0];
			var attributes = utilities.parseAttributes(functionTag);

			if (!attributes.path) { return ''; } //don't know where to find code behind file

			var paramBlock = match[2];

		    var params = {};
		    var paramRegex = /{@ ([^@}]*)@}([\s\S]*?){\/@}/g;
		    var paramMatch;

			while (paramMatch = paramRegex.exec(paramBlock)) {
				var paramName = paramMatch[1].trim();
		        params[paramName] = paramMatch[2];
		    }

		    var filename = '../../' + this.settings.projectFolder + '/' + this.settings.viewFolder + '/' + attributes.path;
		    var codeBehind = require(filename);
		    if (!codeBehind) { return ''; }

		    var result = codeBehind[functionName].apply(this, [params]);

		    return (result) ? result : '';
		}
		catch (ex) { logger.log('exception in templateParser.processMultiline: ' + ex); }
	};
};
