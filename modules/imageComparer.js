var importer = require('./importer');
var logger = log4js.getLogger();

exports.run = function (req, res) {
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = '../tmp';

    var files = [];
    form.on('file', function (field, file) {
        files.push([field, file]);
    });

    form.on('end', function () {
        var dt = dateTime.create();
        var prefix = dt.format('Ymd-HMSN');

        var fullLocalImageSrcPath = '../public/diff/' + prefix + '/src';
        var fullLocalImageTargetPath = '../public/diff/' + prefix + '/target';
        var fullLocalImageDiffPath = '../public/diff/' + prefix + '/diff';

        fx.mkdirSync(fullLocalImageSrcPath);
        fx.mkdirSync(fullLocalImageTargetPath);
        fx.mkdirSync(fullLocalImageDiffPath);

        var fullLocalImageSrcFile;
        var srcImageFileName;
        var fullLocalImageTargetFile;
        var targetImageFileName;
        var fullLocalImageDiffFile = fullLocalImageDiffPath + "/diff.png";

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var type = file[0];
            logger.info(file[1].name);
            logger.info(file[1].path);

            if (type == 'source') {
                srcImageFileName = file[1].name;
                fullLocalImageSrcFile = fullLocalImageSrcPath + "/" + srcImageFileName;
                fs.renameSync(file[1].path, fullLocalImageSrcFile);
            }
            else if (type == 'target') {
                targetImageFileName = file[1].name;
                fullLocalImageTargetFile = fullLocalImageTargetPath + "/" + targetImageFileName;
                fs.renameSync(file[1].path, fullLocalImageTargetFile);
            }
            else {
                logger.warn('Not support file, just ignore');
            }
        }

        logger.info('Start to compare images');

        resemble.outputSettings({
            errorColor: {
                red: 255,
                green: 0,
                bule: 255
            },
            errorType: 'movement',
            transparency: 0.3,
            largeImageThreshold: 0,
            useCrossOrigin: false,
            outputDiff: true
        });


        var diff = resemble(fullLocalImageSrcFile).compareTo(fullLocalImageTargetFile).onComplete(function (data) {
            logger.info('Compare complete');

            data.getDiffImage().pack().pipe(fs.createWriteStream(fullLocalImageDiffFile))
                .on('close', function () {
                    var ip = getIpAddress();

                    var sourceImageUrl = "http://" + ip + ":8848/diff/" + prefix + "/src/" + srcImageFileName;
                    var targetImageUrl = "http://" + ip + ":8848/diff/" + prefix + "/target/" + targetImageFileName;
                    var diffImageUrl = "http://" + ip + ":8848/diff/" + prefix + "/diff/diff.png";


                    var templateData = {
                        "source_img_url": sourceImageUrl,
                        "target_img_url": targetImageUrl,
                        "diff_img_url": diffImageUrl
                    };
                    var html = ejs.renderFile('../views/compareresult.ejs', templateData, function (err, data) {
                        if (err) {
                            logger.info(err);
                        }
                        else {
                            logger.info('Send back a response');
                            logger.info(data.toString());
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write(data.toString());
                            res.end();
                        }
                    });


                });

        });


    });

    form.parse(req);
};

function getIpAddress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }

    }

}