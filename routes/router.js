var importer = require('../modules/importer');
var logger = log4js.getLogger();
var router = express.Router();
var imageComparer = require('../modules/imageComparer');


router.post('/image/compare', function(req, res, next) {
  logger.info('Receive a image compare request');
  imageComparer.run(req,res);
});

module.exports = router;
