module.exports = function(grunt) {

// project subfolder
var folder = grunt.option('folder') || '';

// Google Analytics tag, to add in dist
var emailname = grunt.option('emailname') || 'EMAILNAME';

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),


	paths: {
		layouts: 'layouts',
		templates: 'templates',
		src: 'src/' + folder,
		build: 'build/' + folder,
		dist: 'dist'/ + folder,
		pdf: 'pdf', // eventually put pdfs in project folders
		folder: folder
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
		    message: ''
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


    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'EMAILNAME',
              replacement: emailname
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
	    files: ['<%= paths.src %>*.html', '<%= paths.src %>/*.scss'],
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


    // load all Grunt tasks
    require('load-grunt-tasks')(grunt);

	// `grunt`
	grunt.registerTask('default', ['watch']);

	// `grunt dist --emailname=September+2015+Newsletter`
	grunt.registerTask('dist', ['processhtml:dist','replace:dist']);

	// debugging
/*
	grunt.event.on('watch', function(action, filepath, target) {
// 	  grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
	  grunt.log.writeln(folder);
	});
*/

};
