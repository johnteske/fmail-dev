#fmail-dev
Streamlining HTML email development using Grunt, working within limitations of ESP.

###Limitations of Email Service Provider
Does not support:

* Multi-part MIME
* `<head>` and `<body>` tags
* embedded style sheets
* `<vml>` tags

##Workflow

###1. Generate new working document from templates
`grunt template` (to be created)

###2. Develop email
1. Start `grunt watch`
2. Modify HTML and SCSS files in `src` directory, which will:
	* Compile SCSS to CSS
	* Inline CSS
	* Remove certain tags and lines from source files
3. Send tests (from `build` directory)

###3. Finalize email for distribution
`grunt dist --emailname=September+2015+Newsletter`

###4. Archive assets
`grunt archive` (to be created)