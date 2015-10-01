# fmail-dev
Streamlining HTML email development using Grunt

### Requirements
* [Node.js](https://nodejs.org/)
* [Grunt-cli and Grunt](http://gruntjs.com/)

### Set up
```
git clone https://github.com/johnteske/fmail-dev
cd fmail-dev
npm install
```

## Workflow

#### Create new project

`grunt new` (assembles all templates into `src` directory)

`grunt new --project= --date= --template=`
* creates project folder and JSON data file
* generates working HTML document from template

#### Develop email
1. `grunt watch` watches for changes to HTML and SCSS files
2. Modify HTML and SCSS files in `src` directory, which will:
	* Compile SCSS to CSS
	* Inline CSS
	* Remove certain tags and lines from source files
3. Send tests (from `build` directory)

#### Finalize email for distribution
`grunt dist --project=September-2015-Newsletter`

#### Archive assets
`grunt archive` (to be created)

### Templates
#### Not Supported by Email Service Provider

* Multi-part MIME
* `<head>`, `<style>`, `<body>`, `<vml>` tags

## To do

#### Development and watch task
* `grunt watch` default to all folders in src unless project is specified
* default `grunt` task should build once, accepts project parameter
* upload local images to server
* fix, streamline pdf previews

#### Project creation
* add templates
* copy `.scss` files to project folder
* open new file in browser upon creation—or at least `build` directory. could also be task of its own.

#### Distribution
* currently emailName is pulled from project parameter—pull it from project.json
* add alias for shorthand i.e. `grunt dist:September-2015-Newsletter`

#### Archive
* create task
* add subject line as comment in final, archived html file

#### Maintenance and documentation
* reconfigure todo and workflow list as checkboxes?
* add requirements and setup information
* test with `grunt-replace` v0.10.2
* look into express server over livereload
* replace `assemble` with `grunt-assemble`?
