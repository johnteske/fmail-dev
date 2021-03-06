module.exports = function(grunt) {

    var path = require('path'); // to get absolute path

    // options
    var project = grunt.option('p') || grunt.option('project'); //var project = checkProj();
    // var emailName = grunt.option('emailname');
    var logoColor = grunt.option('logo') || 'red';
    var sendDate = grunt.option('date') || grunt.template.today('yymmdd');
    var archivePrepend = sendDate + "-";

    var paths = { // specify here to allow use in functions outside of grunt config
        templates: 'templates',
        src: 'src/' + project,
        build: 'build/' + project,
        dist: 'dist/' + project,
        // archive: 'archive/', // add project and sendDate in task
        // pdf: 'pdf', // eventually put pdfs in project folders
        ignore: '_*.*' // ignore files with leading underscore
    };

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

        emailName: grunt.option('emailname'),

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
            new: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= paths.templates %>',
                    src: [
                        'css/*.scss', '!css/<%= paths.ignore %>',
                        'emails/*.hbs'
                    ],
                    dest: '<%= paths.src %>'
                }]
            },
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
                    // expand: true,
                    // cwd: '<%= paths.build %>',
                    // src: '*.pdf',
                    // dest: '<%= priv.archive.html %>/' + archivePrepend,
                    // rename: function(dest, src) {
                    //  return dest + archivePrepend + src;
                    // }
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
                widthElements: ['table', 'td', 'img'], // heightElements: ['img'], // this seems to be a juice option--is it available in grunt-juice?
                applyWidthAttributes: true,
                webResources: {
                    images: false
                }
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.src %>',
                    src: ['*.html', '!<%= paths.ignore %>'],
                    dest: '<%= paths.build %>'
                }]
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
                args:[
                    '<%= paths.templates %>/assets/logo-2015.png', '-background', logoColor, '-alpha', 'remove', '-resize', '290',
                    '<%= paths.src %>/logo-' + logoColor.replace('#','') + '.jpg'
                ]
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
                        { match: /\sclass=["'][\w \-]*['"]/g, replacement: '' }, // remove CSS classes
                        { match: /<!--([\S\s]*?)-->/g, replacement: '' }, // remove HTML comments
                        { match: 'EMAILNAME', replacement: '<%= emailName %>' },
                        { match: '!img', replacement: 'img' } // enable tracking image
                    ],
                    usePrefix: false
                },
                files: [{
                    expand: true, flatten: true, src: ['<%= paths.dist %>/*.html'], dest: '<%= paths.dist %>'
                }]
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
    // grunt.loadNpmTasks('assemble');

    // load all Grunt tasks
    require('load-grunt-tasks')(grunt);


    // project
    function checkProject() {
        if (project) {
            if (!grunt.file.exists('src/' + project)) {
                grunt.fatal('\nProject folder \'' + paths.src + '\' does not exist.\nTry running grunt from the paths.src directory, where you can use tab auto-completion on project folder names.')
            }
        }
        else {
            grunt.fatal('\nPlease specify project folder by using \'--project=Project-Folder-Name\' or \'--p=Project-Folder-Name\'');
        }
        grunt.log.ok("project: " + project);
    }
    grunt.registerTask('checkProject', function() { checkProject(); });

    grunt.registerTask('new', ['copy:new']);

    // grunt.registerTask('default', ['assemble', 'sass', 'juice']);
    grunt.registerTask('default', ['concurrent:compile', 'juice']);

    grunt.registerTask('pdf', ['exec:open_paparazzi']);

    grunt.registerTask('ftp', ['ftp_push']);

    grunt.registerTask('test', ['processhtml:test']);

    // emailName: Google Analytics tag, to add in dist
    function checkEmailName() {
        var emailstring = "emailname: ";

        if (grunt.config.get('emailName')) {
            // if --emailname is passed, use it
            grunt.log.ok(emailstring + grunt.config.get('emailName'));
        }
        else {
            // if no --emailname passed, check the source .hbs files
            var projSrc = paths.src;
            var hbsFiles = grunt.file.expand( {cwd: projSrc}, ['*.hbs','!_*.*'] );
            var firstFile = projSrc + "/" + hbsFiles[0];
            var newemail = '';

            if (grunt.file.exists(firstFile)) {
                // read file, get 'emailname:' line
                var hbsF = grunt.file.read(firstFile, "utf-8");
                hbsF = /^(\s*)emailname:[ \S]*/m.exec(hbsF); //
                if (hbsF !== null) {
                    newemail = hbsF.toString().replace(/(\s*)emailname: ?/i, "").replace(/,/g, "") // quick fix to remove trailing comma
                }
            }

            if(newemail !== '') {
                grunt.log.ok("\'emailname\' found in front matter of file: " + firstFile);
                grunt.log.ok(emailstring + newemail);
            } else {
                // if still no success, use modified version of project name
                var newemail = project.replace(/-/g, "+").replace(/\//, '');
                grunt.log.warn("\'emailname\' not found in .hbs front matter, using converted project name.\n");
                grunt.log.warn(emailstring + newemail);
            }
            grunt.config.set('emailName', newemail);

        }
    }
    grunt.registerTask('checkEmailName', function() { checkEmailName(); });

    grunt.registerTask('dist', ['checkEmailName', 'processhtml:dist', 'replace:dist']);

    grunt.registerTask('archive', ['copy:archive']); // 'clean'


    function checkColor() {
        // get .scss files, ignore files that start with an underscore
        var projSrc = paths.src;
        var scssFiles = grunt.file.expand( {cwd: projSrc}, ['*.scss','!_*.*'] ); //console.log(scssFiles)
        var firstFile = projSrc + "/" + scssFiles[0];
        var data = '';

        if (grunt.file.exists(firstFile)) { //console.log(firstFile);
            // read file, get 'emailname:' line
            var scssF = grunt.file.read(firstFile, "utf-8");
            scssF = /^(\s*)\$main-color:\s*[\S]*/.exec(scssF);

            if (scssF !== null) {
                 data = scssF.toString().replace(/\$main-color: ?/i, "").replace(';','').replace(',',''); // .replace(/-/g, "+") // further filtering needed?
            }
        }
        console.log(data);
        //
        // if (data !== '') {
        //         // grunt.log.warn( data );
        //         return data;
        // }
        // else { grunt.log.warn("$main-color not found"); }
        // // TODO: put project fallback here, can print either passed or fallback project name to console
        grunt.log.ok("logo color: " + logoColor);
    }
    grunt.registerTask('checkColor', function() { checkColor(); });

    grunt.registerTask('logo', ['checkProject', 'checkColor', 'imagemagick-convert:logo']);


    grunt.registerTask('comb', 'Display links to check urls and analytics tags', function() {
        var projSrc = paths.build; // check build dir, so .hbs file is not required in development
        var hbsFiles = grunt.file.expand( {cwd: projSrc}, ['*.html','!_*.*'] );
        var firstFile = projSrc + "/" + hbsFiles[0]; // get first file
        var data = '';

        if (grunt.file.exists(firstFile)) { // console.log(firstFile);
            // read file, get 'emailname:' line
            var hbsF = grunt.file.read(firstFile, "utf-8");
            hbsF = hbsF.match(/href="([^"]*)"/g);

            if (hbsF !== null) {
                data = hbsF; // .toString();
            }
        }
        //else "file not found"

        if (data !== '') { console.log(data); console.log(data.length + " links found.") } // return data }
        else { grunt.log.warn("no links found"); }
    });

};
