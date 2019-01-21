"use strict";

module.exports = function (grunt) {

    require("jit-grunt")(grunt, {
        configureProxies: "grunt-connect-proxy"
    });

    var browserSync = require('browser-sync').create();
    // Project properties
    var webAppDir = "webapp";
    var targetDir = "target";
    var tmpDir = targetDir + "/tmp";
    var tmpDirDbg = targetDir + "/tmp-dbg";
    var tmpDirUglified = targetDir + "/tmp-uglified";
    var zipFileSuffix = ".zip";
    var zipFileUglifiedSuffix = "-uglified.zip";
    var preloadPrefix = "target/tmp";

    //Upload Credentials
    var sUser = grunt.option("user");
    var sPwd = grunt.option("pwd");
    var sPackage = grunt.option("pkg") === undefined ? "$TMP" : grunt.option("pkg");
    var sTransportNo = grunt.option("trs") === undefined ? "" : grunt.option("trs");
    var sBspContainer = grunt.option("name");
    var sCText = grunt.option("text");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            build: [targetDir]
        },
        encoding: {
            options: {
                encoding: "UTF8"
            },
            files: {
                src: [webAppDir + "/**/*.js", webAppDir + "/**/*.css",
                    webAppDir + "/**/*.xml", webAppDir + "/**/*.json",
                    webAppDir + "/**/*.html", webAppDir + "/**/*.properties"]
            }
        },
        copy: {
            copyToUglified: {
                files: [
                    {
                        expand: true,
                        src: ["**/*.js", "!**/ui5resources/**/*"],
                        dest: tmpDirUglified,
                        cwd: webAppDir,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp(webAppDir + "(\\/|\\\\)localService", "gi"));
                        }
                    },
                    {
                        expand: true,
                        src: ["**/*.css", "!**/ui5resources/**/*"],
                        dest: tmpDirUglified,
                        cwd: webAppDir
                    },
                    {
                        expand: true,
                        src: "localService/metadata.xml",
                        dest: tmpDirUglified,
                        cwd: webAppDir
                    },
                    {
                        expand: true,
                        src: ["**/*", "!**/ui5resources/**/*"],
                        dest: tmpDirUglified,
                        cwd: webAppDir,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp("(" + webAppDir + "(\\/|\\\\)test|${webAppDir}(\\/|\\\\)localService|\\.js$|\\.css$|\\test.html$)", "gi"));
                        }
                    }]
            },
            copyToDbg: {
                files: [
                    {
                        expand: true,
                        src: ["**/*.js", "!**/ui5resources/**/*"],
                        dest: tmpDirDbg,
                        cwd: webAppDir,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp(webAppDir + "(\\/|\\\\)localService", "gi"));
                        }
                    },
                    {
                        expand: true,
                        src: ["**/*.css", "!**/ui5resources/**/*"],
                        dest: tmpDirDbg,
                        cwd: webAppDir
                    },
                    {
                        expand: true,
                        src: "localService/metadata.xml",
                        dest: tmpDirDbg,
                        cwd: webAppDir
                    },
                    {
                        expand: true,
                        src: ["**/*", "!**/ui5resources/**/*"],
                        dest: tmpDirDbg,
                        cwd: webAppDir,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp("(" + webAppDir + "(\\/|\\\\)test|${webAppDir}(\\/|\\\\)localService|\\.js$|\\.css$|\\test.html$)", "gi"));
                        }
                    }]
            },
            copyToTmp: {
                files: [
                    {
                        expand: true,
                        src: ["**/*.js", "!**/ui5resources/**/*"],
                        dest: tmpDir,
                        cwd: webAppDir,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp(webAppDir + "(\\/|\\\\)localService", "gi"));
                        }
                    },
                    {
                        expand: true,
                        src: ["**/*.css", "!**/ui5resources/**/*"],
                        dest: tmpDir,
                        cwd: webAppDir
                    },
                    {
                        expand: true,
                        src: "localService/metadata.xml",
                        dest: tmpDir,
                        cwd: webAppDir
                    },
                    {
                        expand: true,
                        src: ["**/*", "!**ui5resources/**/*"],
                        dest: tmpDir,
                        cwd: webAppDir,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp("(" + webAppDir + "(\\/|\\\\)test|${webAppDir}(\\/|\\\\)localService|\\.js$|\\.css$|\\test.html$)", "gi"));
                        }
                    }]
            },
            copyDbgToTmp: {
                files: [
                    {
                        expand: true,
                        src: "**/*.js",
                        dest: tmpDir,
                        cwd: tmpDirDbg,
                        rename: function (dest, src) {
                            return dest + "/" + src.replace(/((\.view|\.fragment|\.controller)?\.js)/, "-dbg$1");
                        }
                    },
                    {
                        expand: true,
                        src: "**/*.css",
                        dest: tmpDir,
                        cwd: tmpDirDbg,
                        rename: function (dest, src) {
                            return dest + "/" + src.replace(".css", "-dbg.css");
                        }
                    },
                    {
                        expand: true,
                        src: "localService/metadata.xml",
                        dest: tmpDir,
                        cwd: tmpDirDbg
                    },
                    {
                        expand: true,
                        src: "**/*",
                        dest: tmpDir,
                        cwd: tmpDirDbg,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp("(" + webAppDir + "(\\/|\\\\)test|${webAppDir}(\\/|\\\\)localService|\\.js$|\\.css$|\\test.html$)", "gi"));
                        }
                    }]
            }
        },
        uglify: {
            uglifyTmp: {
                files: [
                    {
                        expand: true,
                        src: "**/*.js",
                        dest: tmpDir,
                        cwd: tmpDir,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp(webAppDir + "(\\/|\\\\)localService", "gi"));
                        }
                    }]
            },
            uglifyTmpUglified: {
                files: [
                    {
                        expand: true,
                        src: "**/*.js",
                        dest: tmpDirUglified,
                        cwd: tmpDirUglified,
                        filter: function (filepath) {
                            return !filepath.match(new RegExp(webAppDir + "(\\/|\\\\)localService", "gi"));
                        }
                    }]
            },
            uglifyPreload: {
                files: [
                    {
                        expand: true,
                        src: tmpDir + "/Component-preload.js"
                    }]
            }
        },
        cssmin: {
            build: {
                files: [
                    {
                        expand: true,
                        src: "**/*.css",
                        dest: tmpDir,
                        cwd: webAppDir
                    }]
            }
        },
        zip: {
            normal: {
                cwd: tmpDir,
                src: tmpDir + "/**/*",
                dest: "./zip" + "/<%= pkg.name %>" + zipFileSuffix
            },
            uglified: {
                cwd: tmpDirUglified,
                src: tmpDirUglified + "/**/*",
                dest: "./zip" + "/<%= pkg.name %>" + zipFileUglifiedSuffix
            },

        },
        openui5_preload: {
            preloadDbg: {
                options: {
                    resources: {
                        cwd: tmpDirDbg,
                        src: ["**/*.js"],
                        prefix: preloadPrefix
                    },
                    compress: false,
                    dest: tmpDirDbg
                },
                components: true
            },
            preloadTmp: {
                options: {
                    resources: {
                        cwd: tmpDir,
                        src: ["**/*.js"],
                        prefix: preloadPrefix
                    },
                    compress: false,
                    dest: tmpDir
                },
                components: true
            },
            preloadUglified: {
                options: {
                    resources: {
                        cwd: tmpDirUglified,
                        src: ["**/*.js"],
                        prefix: preloadPrefix
                    },
                    compress: false,
                    dest: tmpDirUglified
                },
                components: true
            },
        },
        settings: {
            connect: {
                host: "localhost",
                port: "9555"
            },
            proxy: {
                host: "<HOST>",
                port: "<PORT>"
            }
        },

        connect: {
            options: {
                hostname: "<%= settings.connect.host %>",
                port: "<%= settings.connect.port %>",
                livereload: 35729,
                middleware: function (connect, options, defaultMiddleware) {
                    var aMiddlewares = [];
                    aMiddlewares.push(require("grunt-connect-proxy/lib/utils").proxyRequest);
                    aMiddlewares.push(defaultMiddleware);
                    return aMiddlewares;
                }
            },
            connectWebapp: {
                options: {
                    base: ["webapp"],
                    open: true
                }
            },
            proxies: [
                {
                    context: "/resources",
                    host: "<%= settings.proxy.host %>",
                    port: "<%= settings.proxy.port %>",
                    https: false,
                    rewrite: {
                        "/resources": "/sap/public/bc/ui5_ui5/resources"
                    }
                }, {
                    context: "/sap/opu/odata",
                    host: "<%= settings.proxy.host %>",
                    port: "<%= settings.proxy.port %>",
                    https: false
                }
            ]
        },
        nodemon: {
            dev: {
                script: 'index.js',
            },

            options: {
                ext: 'js,html,xml,css,properties,json',
                watch: ["./*", "./webapp/*", "./webapp/**/*"],
                // omit this property if you aren't serving HTML files and
                // don't want to open a browser tab on start
                callback: function (nodemon) {
                    nodemon.on('log', function (event) {
                        console.log(event.colour);
                    });
                    // opens browser on initial server start
                    nodemon.on('config:update', function () {
                        // Delay before server listens on port
                        setTimeout(function() {
                            require('open')('http://localhost:3000');
                        }, 1000);
                    });
                    // refreshes browser when server reboots
                    nodemon.on('restart', function () {
                        browserSync.init({
                            port: 3000,                      //this can be any port, it will show our app
                            proxy: 'http://localhost:3000/', //this is the port where express server works
                            ui: {port: 3001},                //UI, can be any port
                            reloadDelay: 1000                //Important, otherwise syncing will not work
                        });
                        browserSync.reload;
                    });

                }
            }
        },
        concurrent: {
            dev: {
                tasks: ['jshint', 'watch', 'nodemon'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        jshint: {
            options: {
                reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
            },
            // when this task is run, lint the Gruntfile and all js files in src
            build: ['Grunfile.js', "./*", "./webapp/*", "./webapp/**/*"]
        },
        watch: {
		files: ["./*", "./webapp/*", "./webapp/**/*"],
            options: {
                livereload: true
             }
        },
        nwabap_ui5uploader: {
            options: {
                conn: {
                    server: '<SERVER>',
                },
                auth: {
                    user: sUser,
                    pwd: sPwd
                }
            },
            upload_build: {
                options: {
                    ui5: {
                        package: sPackage,
                        bspcontainer: sBspContainer,
                        bspcontainer_text: sCText,
                        transportno: sTransportNo
                    },
                    resources: {
                        cwd: 'target/tmp',
                        src: '**/*.*'
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('liveserver', '', function() {
        var taskList = [
            'jshint',
            'nodemon',
            'watch'
        ];
        grunt.task.run(taskList);
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-encoding");
    grunt.loadNpmTasks("grunt-zip");
    grunt.loadNpmTasks("grunt-nwabap-ui5uploader");
    grunt.loadNpmTasks("grunt-openui5");

    grunt.registerTask("createZip", ["zip:normal"]);
    grunt.registerTask("createUglifiedZip", ["uglified", "zip:uglified"]);
    grunt.registerTask("uglified", ["copy:copyToUglified", "openui5_preload:preloadUglified", "uglify:uglifyTmpUglified"]);
    grunt.registerTask("serve", ["configureProxies:server", "connect:connectWebapp", "watch:watchWebapp"]);
    grunt.registerTask("upload", ["nwabap_ui5uploader"]);
    grunt.registerTask("default", ["clean", "copy:copyToDbg", "openui5_preload:preloadDbg", "copy:copyToTmp",
        "uglify:uglifyTmp", "cssmin", "openui5_preload:preloadTmp", "copy:copyDbgToTmp",
        "uglify:uglifyPreload"]);

};
