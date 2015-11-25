module.exports = function(grunt) {

    var fs = require('fs');
    var path = require('path');  // to get absolute path
    //require('time-grunt')(grunt);

    // project
    function checkProj() {
        if ( grunt.option('force') ) { return '' }
        else { grunt.fail.warn('Please specify project folder.') };
    };
    var project = grunt.option('project') || checkProj();

    // Google Analytics tag, to add in dist
    var emailName = grunt.option('emailname') || project.replace(/-/g, "+").replace(/\//, '');

    // which template to use on assemble
    // var template = grunt.option('template') || '*.hbs';

    // send date
    var sendDate = grunt.option('date') || grunt.template.today('yymmdd');

    var priv_defaults = {
        "archive": {
            "html": "archive",
            "pdf": "archive",
            "img": "archive"
        }
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        priv: grunt.file.exists('private.json') ? grunt.file.readJSON('private.json') : priv_defaults,

        paths: {
            templates: 'templates',
            // template: template,
            src: 'src/' + project,
            build: 'build/' + project,
            dist: 'dist/' + project,
            // archive: 'archive/' + project,
            // pdf: 'pdf', // eventually put pdfs in project folders
            ignore: '_*.*' // ignore files with leading underscore
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
                src: ['<%= paths.src %>/*.hbs', '!<%= paths.src %>/<%= paths.ignore %>'],
                dest: '<%= paths.src %>/'
            }
        },


        // TODO copy scss files into project folders
        // folder name: project
        copy: {
            // new_project: {
            //     files: [{
            //         expand: true,
            //         cwd: '<%= paths.src %>',
            //         src: '<%= paths.src %>',
            //         dest: '<%= paths.src %>'
            //     }]
            // },
            archive: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= paths.build %>',
                        src: '*.html',
                        dest: '<%= priv.archive.html %>/' + sendDate + "-" + project
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.build %>',
                        src: '*.pdf',
                        dest: '<%= priv.archive.pdf %>/' + sendDate + "-" + project
                    },
                    {
                    // will more likely be source folder
                    // also ignore anything matching <%= paths.ignore %>
                        expand: true,
                        cwd: '<%= paths.build %>',
                        src: '*.{gif,jpg,png,psd}',
                        dest: '<%= priv.archive.img %>/' + sendDate + "-" + project
                    }
                ]
            },
        },


        // create json data file (and project folder if needed)
        // json_generator: {
        //     target: {
        //         dest: '<%= paths.src %>/project.json',
        //         options: {
        //             project: project,
        //             emailName: emailName,
        //             sendDate: sendDate,
        //             subjectline: "",
        //             recipients: "", // who
        //             number: 0 // how many
        //         }
        //     }
        // },


        // compile CSS
        sass: {
            build: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.src %>',
                    src: ['*.scss'],
                    dest: '<%= paths.src %>/styles',
                    ext: '.css'
                }]
            }
        },


        // inline CSS
        juice: {
            options: {
                widthElements: ['table', 'td', 'img'],
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
                        src: ['*.html', '!<%= paths.ignore %>'],
                        dest: '<%= paths.build %>'
                    }
                ]
            }
        },


        exec: {
            // create PDF for preview/archive
            // open first build/ file in Paparazzi!
            open_paparazzi: {
                cmd: function() {
                    // <%= paths.build %> template does not work
                    // var thisFile = '<%= paths.build %>/*.html';

                    var thisFile = 'build/' + project + '/*.html';
                    thisFile = grunt.file.expand(thisFile)[0]; // first only
                    thisFile = path.resolve(thisFile);
                    return 'open ' + thisFile + ' -a Paparazzi!';
                }
            }
        },


        ftp_push: {
            your_target: {
                options: {
                    authKey: "serverA",
                    host: "ftp.johnteskemusic.com",
                    dest: "/public_html/test/<%= grunt.template.today('yyyymm') %>",
                    port: 21
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.src %>',
                    src: [ "*.jpg", "*.gif" ]
                }]
            }
        },


        processhtml: {
            options: {
                process: true,
                strip: true
            },
            // test
            test: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.build %>',
                    src: ['*.html'],
                    dest: '<%= paths.dist %>',
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
                        { match: 'EMAILNAME', replacement: emailName },
                        { match: '!img', replacement: 'img' }
                    ],
                    usePrefix: false
                },
                files: [
                    {expand: true, flatten: true, src: ['<%= paths.dist %>/*.html'], dest: '<%= paths.dist %>'}
                ]
            }
        },


        open: {
            build: {
                path: '<%= paths.build %>'
                // app: 'Google Chrome'
            }
        },


        // watch for changes to HTML & SCSS files
        watch: {
            templates: {
              files: ['<%= paths.templates %>/css/scss/*','<%= paths.src %>/*.hbs','<%= paths.templates %>/layouts/*','<%= paths.templates %>/partials/*','<%= paths.templates %>/data/*','<%= paths.templates %>/helpers/*'],
              tasks: ['newer:assemble'],
              options: {
                  atBegin: true
              }
            },
            source: {
                files: ['<%= paths.src %>/*.html', '<%= paths.src %>/*.scss', '!<%= paths.src %>/<%= paths.ignore %>'],
                tasks: ['newer:sass', 'juice'], // tasks: ['default'],
                options: {
                    spawn: false,
                    atBegin: true
                }
            },
            configFiles: {
                files: ['Gruntfile.js'],
                options: {
                    reload: true
                }
            }
        },


        // clean the build, dist directories
        clean: {
            options: {
                'no-write': false
            },
            build: ["<%= paths.build %>/**"],
            dist: ["<%= paths.dist %>/**"]
        },


        concurrent: {
            compile: ['newer:assemble', 'newer:sass']
        }


    }); // grunt.initConfig


    // load assemble
    grunt.loadNpmTasks('assemble');

    // load all Grunt tasks
    require('load-grunt-tasks')(grunt);

    // `grunt new`
    // grunt.registerTask('new', ['json_generator', 'assemble', 'open']);
    // grunt.registerTask('new', ['assemble', 'open']);

    // `grunt --project=September+Newsletter`
    // grunt.registerTask('default', ['assemble', 'sass', 'juice']);
    grunt.registerTask('default', ['concurrent:compile', 'juice']);

    // `grunt pdf --project=September+Newsletter`
    grunt.registerTask('pdf', ['exec:open_paparazzi']);

    // `grunt ftp --project=September+Newsletter`
    grunt.registerTask('ftp', ['ftp_push']);

    // `grunt test --project=September+Newsletter`
    grunt.registerTask('test', ['processhtml:test']);

    // `grunt dist --project=September+Newsletter`
    grunt.registerTask('dist', ['processhtml:dist', 'replace:dist']);

    // `grunt archive --project=September+Newsletter`
    grunt.registerTask('archive', ['copy:archive', 'clean']);

    // `grunt yfm --project=September+Newsletter`
    grunt.registerTask('yfm', function() {

        // get .hbs files but ignore files that start with an underscore
        var projSrc = grunt.config.get('paths.src');
        var hbsFiles = grunt.file.expand( {cwd: projSrc}, ['*.hbs','!_*.*'] );
        var srcFile = projSrc + hbsFiles[0];

        if(srcFile) {
            console.log("yes");
    
            var data = '';
            // try to read .hbs file to extract YFM
            try {
                // here is where emailname would be extracted
                data = fs.readFileSync(srcFile, "utf-8");//, function(err) { console.log(err) });
            }
            // if error, continue and use other fallbacks
            catch(err) { grunt.log.warn(err); }

            console.log(data.toString());
        // grunt.option('emailname')
        }

    });

};
