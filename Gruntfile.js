module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch:{
      scripts: {
        files:['./www/**/*.coffee'],
        tasks:["coffee"],
        options:{
          spawn: true,
        }
      },
    },
    coffee: {
      glob_to_multiple:{
        expand: true,
        flatten: true,
        cwd: 'www/js/coffee',
        src: ['*.coffee'],
        dest: 'www/js/',
        ext: '.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ["coffee"]);
};
