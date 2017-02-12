module.exports = function(grunt) {
    var filesToMakeAppJS = ['public/ts/app.js', 'public/ts/*.js'];

    var filesToWatch = function(){
        return filesToMakeAppJS;
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            default: {
                src: ['public/**/*.ts'],
                tsconfig: true
            }
        },
        express: {
            options: {
                script: 'index.js',
                background: false
            }
        },
        concat: {
            app: {
                banner: '/* <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                src: filesToMakeAppJS,
                dest: 'public/ts/bundle/app.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: true
            },
            build: {
                src: 'public/ts/bundle/app.js',
                dest: 'public/ts/bundle/app.min.js'
            }
        },
        watch: {
            js: {
                files: ['public/**/*.ts'],
                tasks: ['ts', 'concat', 'uglify'],
                options: {
                    livereload: true
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');

    // Default task(s).
    grunt.registerTask('default', ['ts', 'concat', 'uglify']);

};