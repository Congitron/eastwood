# README #

The project with no name.

### Why should I use Eastwood? ###

* You shouldn't.  There aren't enough web frameworks out there yet so you should go write your own.

* [Because](http://themacguffinmen.com/wp-content/uploads/2015/08/clint1.jpg)
* Or maybe you're just feeling [lucky](http://dataontop.com/wp-content/uploads/2012/05/dirty-harry-ice-cream-e1337019710362.jpg)

### Template Language ###

Eastwood has a basic template engine which supports these tags:

* value
* static
* include
* function

Here are some examples:

* {: value name="siteName" :}
* {: static path="images/eastwood.jpg" id="eastwoodPic" :}
* {: include path="test.html" :}
* {: function name="multiply" x="5" y="7" :}


### urls.json ###

Your project folder has a urls.json file.  This tells Eastwood how to route requests.  You have two options:

* html file
* controller

The way it works is simple.  If the value has ".html" in the string, it routes to an html file at that path.
If not, it assumes there is a controller with that name in your (project)/(controllers)/ folder

Here's an example urls.json:

{
	"/": "index.html",
	"/test": "testController"
}

So navigating to http://www.example.com/ will serve you the page from (directory where eastwood is running)/(project folder)/index.html

If you navigate to http://www.example.com/test then eastwood will call the GET() function on the controller in (eastwood)/(project)/(controller folder)/testController.js

It's up to you what you want to do from there.

### settings.json ###

The folder where eastwood is running has a settings.json file.  This is where you tell it the name of your folders for models, views, controllers, etc..  You can leave them.

You probably want to change your site name.  Then you can include it in your templates with {: value name="siteName" :}  or whatever...

### Installation ###

* Go install [node.js](https://nodejs.org/)
* Put Eastwood on your server somewhere
* type 'node eastwood.js', or if you're on ubuntu you need to type 'nodejs eastwood.js'

