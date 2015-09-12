# fmail-dev
Streamlining HTML email development using Grunt

## Workflow

### Generate new working document from templates and partials
`grunt new`
`grunt new --project= --date= --template=`
* create project folder and JSON data file
* generate template

### Develop email
1. `grunt` run "watch" task
2. Modify HTML and SCSS files in `src` directory, which will:
	* Compile SCSS to CSS
	* Inline CSS
	* Remove certain tags and lines from source files
3. Send tests (from `build` directory)

### Finalize email for distribution
`grunt dist --emailname=September+2015+Newsletter`

### Archive assets
`grunt archive` (to be created)

## To do
* test with grunt-replace v0.10.2
* look into express server
* open new file in browser upon creation
* reconsider differences in emailname, project name, etc.
* `grunt dist` to pull emailName from project.json file

## Templates
### Limitations of Email Service Provider
Not supported:

* Multi-part MIME
* `<head>`, `<style>`, `<body>`, `<vml>` tags
