module.exports = function(grunt) {

    var path = require('path'); // to get absolute path

    // project
    function checkProj() {
        var proj = grunt.option('project');
        if (proj) {
            if (!grunt.file.exists('src/' + proj)) {
                grunt.fail.fatal('Project folder does not exist.\nTry running commands from the src/ directory to use auto-complete on folder names.')
            }
            else {
                return proj;
            }
        }
        else {
            if ( grunt.option('force') ) { return ''; }
            else { grunt.fail.warn('Please specify project folder.'); }
        }
    }
    var project = checkProj();

    var paths = { // specify here to allow use in functions outside of grunt config
        templates: 'templates',
        src: 'src/' + project,
        build: 'build/' + project,
        dist: 'dist/' + project,
        // archive: 'archive/', // add project and sendDate in task
        // pdf: 'pdf', // eventually put pdfs in project folders
        ignore: '_*.*' // ignore files with leading underscore
    };

    // emailName: Google Analytics tag, to add in dist
    function checkEmailName() {
        // get .hbs files, ignore files that start with an underscore
        var projSrc = paths.src;
        var hbsFiles = grunt.file.expand( {cwd: projSrc}, ['*.hbs','!_*.*'] );
        var srcFile = projSrc + "/" + hbsFiles[0];
        var data = '';

        if (grunt.file.exists(srcFile)) { // console.log(srcFile);

            // read file, get 'emailname:' line
            var hbsF = grunt.file.read(srcFile, "utf-8");
            hbsF = /emailname:[ \S]*/.exec(hbsF);

            if (hbsF !== null) {
                data = hbsF.toString().replace(/emailname: ?/i, ""); // .replace(/-/g, "+") // further filtering needed?
            }
        }

        if (data !== '') { return data; }
        else { grunt.log.warn("emailname not found in .hbs front matter, using project name"); }

    }
    var emailName = grunt.option('emailname') || checkEmailName() || project.replace(/-/g, "+").replace(/\//, '');

    // archive
    var sendDate = grunt.option('date') || grunt.template.today('yymmdd');
    var archivePrepend = sendDate + "-";

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

        paths: paths,


        // assemble email templates
        assemble: {
            options: {
                layoutdir: '<%= paths.templates %>/layouts',
                partials: ['<%= paths.templates %>/partials/**/*.hbs'],
                helpers: ['<%= paths.templates %>/helpers/**/*.js', 'handlebars-helper-include'],
                includes: ['<%= paths.src %>/*.hbs'],
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
                    {   // save build files for conversion to pdf
                        expand: true,
                        cwd: '<%= paths.build %>',
                        src: '*.html',
                        dest: '<%= priv.archive.html %>/' + archivePrepend,
                        rename: function(dest, src) {
                            return dest + 'make_pdf-' + src;
                        }
                    },
                    // {
                    //     expand: true,
                    //     cwd: '<%= paths.build %>',
                    //     src: '*.pdf',
                    //     dest: '<%= priv.archive.html %>/' + archivePrepend,
                    //     rename: function(dest, src) {
                    //         return dest + archivePrepend + src;
                    //     }
                    // },
                    {   // save dist files for HTML archive
                        expand: true,
                        cwd: '<%= paths.dist %>',
                        src: '*.html',
                        dest: '<%= priv.archive.html %>/' + archivePrepend,
                        rename: function(dest, src) {
                            return dest + src;
                        }
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.src %>',
                        src: ['*.{gif,jpg,png,psd}', '!<%= paths.ignore %>'],
                        dest: '<%= priv.archive.img %>/' + archivePrepend + project
                    }
                ]
            },
        },


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


        "imagemagick-convert": {
            logo:{
                args:['<%= paths.templates %>/assets/logo-2015.png', '-background', '#8a7a56', '-alpha', 'remove', '<%= paths.src %>/logo.jpg' ]
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
            // remove GA tracking pixel
            test: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.build %>',
                    src: ['*.html'],
                    dest: '<%= paths.dist %>',
                    ext: '.html'
                }]
            },
            // include GA tracking pixel
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


    // grunt.registerTask('new', ['assemble', 'open']);

    // grunt.registerTask('default', ['assemble', 'sass', 'juice']);
    grunt.registerTask('default', ['concurrent:compile', 'juice']);

    grunt.registerTask('pdf', ['exec:open_paparazzi']);

    grunt.registerTask('ftp', ['ftp_push']);

    grunt.registerTask('test', ['processhtml:test']);

    grunt.registerTask('dist', ['processhtml:dist', 'replace:dist']);

    grunt.registerTask('archive', ['copy:archive']); // 'clean'

    grunt.registerTask('logo', ['imagemagick-convert:logo']);


    grunt.registerTask('comb', 'Display links to check urls and analytics tags', function() {
        var projSrc = paths.build; // check build dir, so .hbs file is not required in development
        var hbsFiles = grunt.file.expand( {cwd: projSrc}, ['*.html','!_*.*'] );
        var srcFile = projSrc + "/" + hbsFiles[0]; // get first file
        var data = '';

        if (grunt.file.exists(srcFile)) { // console.log(srcFile);
            // read file, get 'emailname:' line
            var hbsF = grunt.file.read(srcFile, "utf-8");
            hbsF = hbsF.match(/href.*"/g);

            if (hbsF !== null) {
                data = hbsF; // .toString();
            }
        }

        if (data !== '') { console.log(data); console.log(data.length + " links found.") } // return data }
        else { grunt.log.warn("no links found"); }
    });

};
