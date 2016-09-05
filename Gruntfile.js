module.exports = function (grunt) {
	//disable beeping. Tooked from https://github.com/gruntjs/grunt/issues/808#issuecomment-20903038
	var oldout = process.stdout.write;
	process.stdout.write = function(msg) {
	  oldout.call(this, msg.replace('\x07', ''));
	};

	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-jsdoc");

	grunt.renameTask("watch", "actualWatch");

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		jsdoc: {
			dist: {
				src: ["src/*.js"],
				dest: "doc"
			}
		},
		actualWatch: {
			doc: {
				files: ["src/*.js"],
				tasks: ["jsdoc"]
			}
		}
	});

	grunt.registerTask("watch", ["actualWatch"]);
	grunt.registerTask("doc", ["jsdoc"]);
};
