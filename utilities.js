"use strict";

module.exports = {
	trimString: function(str, trim) {
	    str = str.split(trim);
	    var newstr = '';
	    var firstWord = false;
	    for (var j = 0; j < str.length; j++) {
	        if (str[j]) {
	            if (firstWord) { newstr += trim; }
	            else { firstWord = true; }
	            newstr += str[j];
	        }
	    }

	    return newstr;
	},

	parseAttributes: function (str) {
		//look for patterns of x="y" and return a dictionary of { x: y, ...}
		var set = { };
		var matches = str.match(/[^\=\s]*\s*=\s*\"[^\"]*\"/g);
		if (!matches) { return set; }

		for (var i = 0; i < matches.length; i++) {
			var match = matches[i];
		    var parts = match.split('=');
		    var name = this.trimString(parts[0], ' ');
		    var value = this.trimString(parts[1], ' ');
		    value = this.trimString(value, '"');
		    set[name] = value;
		}

		return set;
	},

	parsePostData: function (str) {
		//look for patterns of x="y" and return a dictionary of { x: y, ...}
		var set = { };
		var matches = str.match(/[^\=\&]*=[^\=\&]*/g);
		if (!matches) { return set; }

		for (var i = 0; i < matches.length; i++) {
			var match = matches[i];
		    var parts = match.split('=');
		    var name = this.trimString(parts[0], ' ');
		    var value = this.trimString(parts[1], ' ');
		    set[name] = value;
		}

		return set;
	},


	//o is an object and members is a list of members that you expect to belong to that object
	assertMembers: function (o, members) {
		var passed = true;

		for (var i = 0; i < members.length; i++) {
			var member = members[i];
			if (!o[member]) {
				passed = false;
				break;
			}
		}

		return passed;
	}
};
