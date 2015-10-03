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

`grunt new --project=September-newsletter --date=150901 --template=`
* creates project folder and JSON data file
* generates working HTML document from template

#### Develop email
1. `grunt watch` watches for changes to HTML and SCSS files
* `grunt watch --project=September-newsletter` watches specified project folder in `src`
* running `grunt watch` from `src` directory allows auto completion on directory names
2. Modify HTML and SCSS files in `src` directory, which will:
	* Compile SCSS to CSS
	* Inline CSS
	* Remove certain tags and lines from source files
3. Send tests (from `build` directory)

#### Finalize email for distribution
`grunt dist --project=September-Newsletter`

#### Archive assets
`grunt archive` (to be created)

### Templates
#### Not Supported by Email Service Provider

* Multi-part MIME
* `<head>`, `<style>`, `<body>`, `<vml>` tags

## To do

#### Development and watch task
* default `grunt watch` should watch all folders in `src` if project is not specified
* default `grunt` task should build once and accept project parameter
* upload local images to ftp server
* fix, streamline pdf previews

#### Project creation
* add templates
* copy `.scss` files to project folder

#### Distribution
* currently emailName is pulled from project parameter—pull it from project.json
* add alias for shorthand i.e. `grunt dist:September-Newsletter`

#### Archive
* create task
* add subject line as comment in final, archived html file
* copy files to archive folders
* clean `build` (and `src`?) directory after archive (require task to make sure copy was successful)

#### Maintenance and documentation
* clean up whitespace in Gruntfile
* reconfigure todo and workflow list as checkboxes?
* add requirements and setup information
* test with `grunt-replace` v0.10.2
* look into express server over livereload
* replace `assemble` with `grunt-assemble`?
