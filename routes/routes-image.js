
/**
 * Image Routes module
 *    these routes require authenticated images
 */
var restify = require('restify')
    , imageController= require('../controller/image');

module.exports = function (app) {


    // Set up routes

    // TODO Need to figure out the explicit REST URI
    // confused, specified gets by id or imagename, seemed to be working
    // then started getting 405 GET not allowed ??
    //       app.get('/api/v1/image/:id', getImageById);
    //       app.get('/api/v1/image/:imagename', getImageByImagename);
    // so went back to a generic path
    /**
     * get a image object by id in Json
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback gets image
     */
    app.get('/api/v1/image', imageController.getImageObject);
    /**
     * get a image by id in url param
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback gets image
     */
    app.get('/api/v1/image/:id', imageController.getImage);

};























