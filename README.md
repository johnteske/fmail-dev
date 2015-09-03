#fmail-dev
Streamlining HTML email development using Grunt, working within limitations of ESP.

###Limitations of Email Service Provider
Not supported:

* Multi-part MIME
* `<head>`, `<style>`, `<body>`, `<vml>` tags

##Workflow

###Generate new working document from templates and partials
`grunt template` (to be created)

###Develop email
1. `grunt` run "watch" task
2. Modify HTML and SCSS files in `src` directory, which will:
	* Compile SCSS to CSS
	* Inline CSS
	* Remove certain tags and lines from source files
3. Send tests (from `build` directory)

###Finalize email for distribution
`grunt dist --emailname=September+2015+Newsletter`

###Archive assets
`grunt archive` (to be created)
