module.exports = function(grunt) {

var testtext = 'test';
var emailname = grunt.option('emailname') || 'EMAILNAME';

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	paths: {
		layouts: 'layouts',
		templates: 'templates',
		src: 'src',
		build: 'build',
		dist: 'dist',
		pdf: 'pdf'
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
	          cwd: '<%= paths.src %>/',
	          src: ['*.html'],
	          dest: '<%= paths.build %>/',
	        },
	      ],
  	    }
    },

// create PDF for preview/archive
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
		    message: testtext
		  }
		},
// build new working document from template
		tempbuild: {
		      files: [{
		        expand: true,
		        cwd: '<%= paths.templates %>',
		        src: ['*.html'],
		        dest: '<%= paths.src %>',
		        ext: '.html'
		      }]
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

// watch for changes to SCSS or HTML files
	watch: {
	  scripts: {
	    files: ['<%= paths.src %>/*.html', '<%= paths.src %>/*.scss'],
		// if using newer:juice, updating sass file will not trigger livereload
	    tasks: ['newer:sass:dist','juice'],
	    options: {
	      spawn: false,
	    },
	  },
	  configFiles: {
	    files: [ 'Gruntfile.js' ],
	    options: {
	      reload: true
	    }
	  }
	}

});

    // Load all Grunt tasks
    require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['watch']);

};