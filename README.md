# fmail-dev
Streamlining HTML email development using Grunt

## Workflow

### Create new project

`grunt new` (assembles all templates into `src` directory)

`grunt new --project= --date= --template=`
* creates project folder and JSON data file
* generates working HTML document from template

### Develop email
1. `grunt watch` watches for changes to HTML and SCSS files
2. Modify HTML and SCSS files in `src` directory, which will:
	* Compile SCSS to CSS
	* Inline CSS
	* Remove certain tags and lines from source files
3. Send tests (from `build` directory)

### Finalize email for distribution
`grunt dist --project=September-2015-Newsletter`
currently emailname is generated from project name

### Archive assets
`grunt archive` (to be created)

## Templates
###	Not Supported by Email Service Provider

* Multi-part MIME
* `<head>`, `<style>`, `<body>`, `<vml>` tags

## To do

### Development and watch task
- [ ] `grunt watch` default  to all folders in src unless project is specified
- [ ] default `grunt` task should build once, accepts project parameter
- [ ] upload local images to server
- [ ] put css files in subfolder, for clarity in development
- [ ] fix, streamline pdf previews

### Project creation
- [ ] add templates
- [ ] copy `.scss` files to project folder
- [ ] open new file in browser upon creation—or at least `build` directory

### Archive
- [ ] create task
- [ ] add subject line as comment in final, archived html file

### Maintenance and documentation
- [ ] add requirements and setup information
- [ ] test with `grunt-replace` v0.10.2
- [ ] look into express server over livereload
- [ ] `grunt dist` to pull emailName from project.json file
- [ ] replace `assemble` with `grunt-assemble`?
