'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({

        watch: {
            js: {
                files: ['scripts/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['styles/**/*.less'],
                tasks: ['autoprefixer', 'less']
            },
            options: {
                livereload: true
            }
        },

        connect: {
            server: {
                options: {
                    open: true,
                    livereload: 35729,
                    hostname: 'localhost'
                }
            }
        },

        less: {
            development: {
                options: {
                    compress: true,
                    paths: ['styles']
                },
                files: {
                    'styles/styles.css': 'styles/styles.less'
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            }
        }
    });

    grunt.registerTask('serve', function () {
        grunt.task.run([
            'less',
            'autoprefixer',
            'connect',
            'watch'
        ]);
    });

    grunt.registerTask('default', ['']);
};