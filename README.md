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

## Files
* For clarity, email projects are created in their own project folders within `src/` and generated to their own folders in `build/` and `dist/`.
* Handlebars and Assemble are use for templating and SCSS is used to compile CSS, reducing the chance for errors, allowing focus on content, and making improvements easier to track.

## Workflow

#### Create new project
Create a new project folder in `src/` with with desired template and SCSS from `templates/`.

<!--
`grunt new` (assembles all templates into `src` directory)

`grunt new --project=September-newsletter --date=150901 --template=`
* creates project folder and JSON data file
* generates working HTML document from template
-->
#### Develop email
##### Edit `.hbs` and `.scss` files in project folder

##### Start `grunt watch` task to watch for changes
Run `grunt watch --project=September-newsletter` to watch a specified project folder in `src/`. Running this task from the `src/` directory allows auto completion on directory names. This task will:
* Generate `.html` from `.hbs` files
* Compile `.scss` to `.css`, in `css/` directory of project
* Create `.html` file with inlined CSS in `build/`

##### Or run `grunt` to generate the files once
Run `grunt --project=September-newsletter` to run `build` command once


##### Send test emails
`grunt test --project=September-Newsletter`
* removes <head> and Subject Line (template-specific)
* removes Google Analytics tracking image (template-specific)

#### Finalize email for distribution
`grunt dist --project=September-Newsletter`
* removes <head> and Subject Line (template-specific)
* replaces EMAILNAME Google Analytics tag with project name
* enables Google Analytics tracking image by replacing '!img' with 'img'. (template-specific)

<!--
#### Archive assets to `archive` directory
`grunt archive --project=September-Newsletter`
-->

### Templates
#### Not Supported by Email Service Provider

* Multi-part MIME
* `<head>`, `<style>`, `<body>`, `<vml>` tags
