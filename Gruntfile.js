module.exports = function(grunt) {

  var config = require('./config')

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build'],
    copy: {

      default: {
        files: [{
          expand: true,
          src: [
          '**',

          '!.DS_Store', '!.git', '!.gitignore', '!node_modules/**', '!Gruntfile.js',

          '!public/css/*.css',
          '!public/js/*.js',
          '!partials/*.ejs', '!views/*.ejs', '!public/**.html'
          ],
          dest: 'build/'
        }]
      }

    },
    cssmin: {

      default: {
        files: [{
          expand: true,
          cwd: 'public/css/',
          src: ['*.css'],
          dest: 'build/public/css/'
        }]
      }

    },
    uglify: {

      default: {
        files: [{
          expand: true,
          cwd: 'public/js/',
          src: ['*.js'],
          dest: 'build/public/js/'
        }]
      }

    },
    htmlcompressor: {

      default: {
        files: [{
          expand: true,
          src: ['partials/*.ejs', 'views/*.ejs', 'public/**.html'],
          dest: 'build/'
        }],
        options: {
          type: 'html',
          preserveServerScript: true,
          removeIntertagSpaces: true,
          removeQuotes:         true,
          compressJs:           true,
          compressCss:          true
        }
      }

    },
    git_deploy: {

      default: {
        options: {
          url: config.deploy.url,
          branch: config.deploy.branch || 'master',
          message: config.deploy.message || 'Herro. This is automatic.'
        },
        src: 'build/'
      },

    }
  });

grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-htmlcompressor');

grunt.loadNpmTasks('grunt-git-deploy');

grunt.registerTask('default', ['clean', 'copy', 'cssmin', 'uglify', 'htmlcompressor']);
grunt.registerTask('deploy', ['default', 'git_deploy', 'clean']);

};
