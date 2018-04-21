module.exports = function (p) {
	var self = this,

	//node.js
	path = require('path'),
	fs = require('fs'),

	//eastwood
	project = p,
	mySelf = require('./templateProcessor.js'),
	templateFunctions = require('../../' + project.settings.projectFolder + '/templateFunctions.js'),
	templateValues = require('../../' + project.settings.projectFolder + '/templateValues.json');

	//self.baseTemplate = null; //these get added on the fly if the template extends a base template, but they're here for reference
	//self.baseBlock = null;

	self.clearTags = function (template) {

	};

	self.processTemplate = function (template, request) {
		//project.orm.user.selectAll(function(rows) {
			//console.log ('rows!?!?!?! ' + JSON.stringify(rows));
		//});

		var matches = template.match(/{:(.*):}/g); //single line tags using {: whatever :} syntax
		if (matches) {
			for (var m = 0; m < matches.length; m++) {
				var match = matches[m];
				var tag = match.replace(/{:(.*):}/g,'$1');
			    tag = Utilities.trimString(tag, ' ');
			    var replacement = self.processTag(template, match, tag, request);
			    template = template.replace(match, replacement);
			}
		}

		var blockRegex = /{!([^!}]*)!}([\s\S]*?){\/!}/g; //multiline tags using {! whatever !} ... {/!} syntax
		var blockMatch;

		while (blockMatch = blockRegex.exec(template)) {
			var replacement = self.processMultiline(template, blockMatch, request);
			template = template.replace(blockMatch[0].toString(), replacement);
		}

		var extended = false;
		if (self.baseTemplate && self.baseBlock) {
			matches = self.baseTemplate.match(/{:(.*):}/g);

			if (!matches) { return template; } //if we can't find a block tag in the base template just return this one without it

			for (var m = 0; m < matches.length; m++) {
			    var match = matches[m];
			    var tag = match.replace(/{:(.*):}/g,'$1');
			    tag = Utilities.trimString(tag, ' ');
			    var action = tag.split(' ')[0];

			    if (action != 'block') { continue; }

			    var attributes = Utilities.parseAttributes(tag);
			    if (attributes.name == self.baseBlock) {
			    	self.baseTemplate = self.baseTemplate.replace(match, template);
			    	extended = true;
			    }
			}
		}

		if (extended) { return self.baseTemplate; }
		return template;
	};

	self.processTag = function (template, match, tag, request) {
		var action = tag.split(' ')[0];
		var attributes = Utilities.parseAttributes(tag);

		// Could set up a dictionary in the constructor so you can just do this:
		// if (tagHandlers[tag]) { return tagHandlers[tag](attributes); }
		// maybe pass (tag, attributes) ..like in the case of the block tag, it just returns the whole tag..
		// return '';
		// That could help make the tag handling more generic
		// Also we could give each tag handler a list of required attributes to check for, like path
		//
		if (action == 'static') { return self.doStatic(attributes); }
		if (action == 'extend') { return self.doExtend(attributes, request); }
		if (action == 'include') { return self.doInclude(attributes, request); }
		if (action == 'block') { return match; }
		if (action == 'value') { return self.doValue(attributes); }
		if (action == 'function') { return self.doFunction(attributes); }

		return ''; //if we can't process it, just remove it
	};

	self.doStatic = function (attributes) {
		if (!attributes.path) { return ''; }

		// can be used like <img src="{: static path="images/mypic.jpg" id="mypic" :}" >
		// or {: static tag="img" path="images/mypic.jpg" id="mypic" :}
		// id is optional

		var staticPath = path.join(project.settings.staticFolder, attributes.path);
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
	};

	self.doExtend = function (attributes, request) {
		if (!attributes.path || !attributes.block) { return ''; }

		var filename = project.settings.projectFolder + '/' + project.settings.viewFolder + '/' + attributes.path;
		var buffer = fs.readFileSync(filename, 'utf-8');
		var base = null;
		if (buffer) {
			var tProc = new mySelf(project);
			base = tProc.processTemplate(buffer, request);
		}

		self.baseTemplate = base; // set the base, which we will insert the extending template into after fully processing it
		self.baseBlock = attributes.block; // this is where we will insert in the base template
		return ''; //we don't insert the base template into the extending template, it's vica versa..
	};

	self.doInclude = function (attributes, request) {
		if (!attributes.path) { return ''; }

		var filename = project.settings.projectFolder + '/' + project.settings.viewFolder + '/' + attributes.path;
		// how can we go async?  We're about to do a recursive call to processTemplate() so we need this to finish first...
		// need to write that async/dependency library
		var buffer = fs.readFileSync(filename, 'utf-8');
		var insert = '';
		if (buffer) {
			var tProc = new mySelf(project);
			insert = tProc.processTemplate(buffer, request);
		}

		return insert;
	};

	self.doValue = function (attributes) {
		if (!attributes.name) { return ''; }

		var value = templateValues[attributes.name];
		return (value) ? value : '';
	};

	self.doFunction = function (attributes) {
		if (!attributes.name) { return ''; }

		var func = templateFunctions[attributes.name];
		if (!func) { return ''; }

		var result = func(attributes);
		return (result) ? result : '';
	};

	self.processMultiline = function (template, match, request) {
		var functionTag = match[1];
		functionTag = Utilities.trimString(functionTag, ' ');
		var functionName = functionTag.split(' ')[0];
		var attributes = Utilities.parseAttributes(functionTag);

		if (!attributes.path) { return ''; } //don't know where to find code behind file

		var paramBlock = match[2];

	    var params = {};
	    var paramRegex = /{@ ([^@}]*)@}([\s\S]*?){\/@}/g;
	    var paramMatch;

		while (paramMatch = paramRegex.exec(paramBlock)) {
			var paramName = Utilities.trimString(paramMatch[1], ' ');
	        params[paramName] = paramMatch[2];
	    }

	    var filename = './' + project.settings.projectFolder + '/' + project.settings.viewFolder + '/' + attributes.path;
	    var codeBehind = require(filename);
	    if (!codeBehind) { return ''; }

	    params.request = request;
	    params.project = project;
	    var result = codeBehind[functionName](params);

	    return (result) ? result : '';
	};
};
