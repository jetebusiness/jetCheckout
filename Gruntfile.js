module.exports = function (grunt) {

    grunt.initConfig({
        pkg:    grunt.file.readJSON("package.json"),
        meta:   {
            banner: "/*\n" +
                    " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
                    " *  <%= pkg.description %>\n" +
                    " *  <%= pkg.homepage %>\n" +
                    " *\n" +
                    " *  Made by <%= pkg.author.name %>\n" +
                    " *  Under <%= pkg.license %> License\n" +
                    " */\n"
        },
        concat: {
            options: {
                banner: "<%= meta.banner %>"
            },
            dist:    {
                src:  ["src/jquery.jetcheckout.js"],
                dest: "dist/jquery.jetcheckout.js"
            }
        },
        jshint: {
            files:   ["src/jquery.jetcheckout.js", "test/**/*"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        jscs:   {
            src:     "src/**/*.js",
            options: {
                config: ".jscsrc"
            }
        },
        uglify: {
            dist:    {
                src:  ["dist/jquery.jetcheckout.js"],
                dest: "dist/jquery.jetcheckout.min.js"
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },
        karma:  {
            unit:   {
                configFile: "karma.conf.js",
                background: true,
                singleRun:  false,
                browsers:   ["PhantomJS", "Firefox"]
            },
            travis: {
                configFile: "karma.conf.js",
                singleRun:  true,
                browsers:   ["PhantomJS"]
            }
        },
        watch:  {
            files: ["src/*", "test/**/*"],
            tasks: ["default"]
        }

    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-karma");

    grunt.registerTask("travis", ["jshint", "karma:travis"]);
    grunt.registerTask("lint", ["jshint", "jscs"]);
    grunt.registerTask("build", ["concat", "uglify"]);
    grunt.registerTask("default", ["jshint", "build", "karma:unit:run"]);
};
