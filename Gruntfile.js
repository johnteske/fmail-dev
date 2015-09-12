module.exports = function(grunt) {

// project
var project = grunt.option('project') || '';

// Google Analytics tag, to add in dist
//var emailName = grunt.option('emailname') || 'EMAILNAME';
var emailName = project.replace(/-/g, "+");

// which template to use on assemble
var template = grunt.option('template') || '*.hbs';

// send date
var sendDate = grunt.option('date') || grunt.template.today('yymmdd');

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),


	paths: {
		layouts: 'layouts',
		templates: 'templates',
		template: template,
		src: 'src/' + project,
		build: 'build/' + project,
		dist: 'dist/' + project,
		pdf: 'pdf', // eventually put pdfs in project folders
	},


// assemble email templates
    assemble: {
      options: {
        layoutdir: '<%= paths.templates %>/layouts',
        partials: ['<%= paths.templates %>/partials/**/*.hbs'],
        helpers: ['<%= paths.templates %>/helpers/**/*.js'],
        data: ['<%= paths.templates %>/data/*.{json,yml}'],
        flatten: true
      },
      pages: {
        src: ['<%= paths.templates %>/emails/<%= paths.template %>'],
        dest: '<%= paths.src %>/'
      }
    },


// TODO copy scss files into project folders
// TODO copy files into archive folders
// folder name: sendDate-project
copy: {
  project: {
	  files: [{
	    expand: true,
	    cwd: '<%= paths.src %>',
	    src:  '<%= paths.src %>',
	    dest: '<%= paths.src %>',
	  }]
  },
},

// create json data file (and project folder if needed)
json_generator: {
    target: {
	    dest: '<%= paths.src %>/project.json',
        options: {
            project: project,
            emailName: emailName,
            sendDate: sendDate,
            subjectline: "",
            recipients: "", // who
            number: 0 // how many
        }
    }
},

// compile CSS
	sass: {
		dist: {
	      files: [{
	        expand: true,
	        cwd: '<%= paths.src %>',
	        src: ['*.scss'],
	        dest: '<%= paths.src %>',
	        ext: '.css'
	      }]
		}
	},


// inline CSS
    juice: {
        options: {
	        widthElements: ['table','td','img'],
	        applyWidthAttributes: true,
	        webResources: {
		        images: false
	        }
        },
        dist: {
	      files: [
	        {
	          expand: true,
	          cwd: '<%= paths.src %>',
	          src: ['*.html'],
	          dest: '<%= paths.build %>',
	        },
	      ],
  	    }
    },


// TODO create PDF for preview/archive
	wkhtmltopdf: {
      dev: {
        src: '<%= paths.src %>/*.html',
        dest: '<%= paths.pdf %>/',
		args: [
// 			'--page-size', 'tabloid',
			'--page-size', 'letter',
			'--dpi', '144',
			'--image-quality', '70',
			'--zoom', '0.75'
	        ]
      }
	},


	processhtml: {
		options: {
		  process: true,
		  data: {
		    message: ''
		  }
		},
// clean the built files, put in dist folder
		dist: {
		      files: [{
		        expand: true,
		        cwd: '<%= paths.build %>',
		        src: ['*.html'],
		        dest: '<%= paths.dist %>',
		        ext: '.html'
		      }]
		}
	},


    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'EMAILNAME',
              replacement: emailName
            }
          ],
          usePrefix: false
        },
        files: [
          {expand: true, flatten: true, src: ['<%= paths.dist %>/*.html'], dest: '<%= paths.dist %>'}
        ]
      }
    },


// watch for changes to HTML & SCSS files
	watch: {
	  source: {
	    files: ['<%= paths.src %>/*.html', '<%= paths.src %>/*.scss'],
	    tasks: ['newer:sass:dist','juice'],
	    options: {
	      spawn: false,
	      atBegin: true
	    },
	  },
	  configFiles: {
	    files: [ 'Gruntfile.js' ],
	    options: {
	      reload: true
	    }
	  }
	}


}); // grunt.initConfig


	// load assemble
	grunt.loadNpmTasks('assemble');

    // load all Grunt tasks
    require('load-grunt-tasks')(grunt);


	// `grunt new`
	grunt.registerTask('new', ['json_generator', 'assemble']);

	// `grunt`
	grunt.registerTask('default', ['watch']);

	// `grunt dist --emailname=September+2015+Newsletter`
	grunt.registerTask('dist', ['processhtml:dist','replace:dist']);


};
