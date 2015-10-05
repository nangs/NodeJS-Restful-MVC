
/**
 * Image Routes module
 *    these routes require authenticated images
 */
var mongoose = require('mongoose')
    , Image = mongoose.model('Image')
    , restify = require('restify');



    /**
     * Gateway request routes to other functions based on params
     * Search for a image by id or imagename
     * if none given get the logged in image's information
     *
     * @param request can include an id, a imagename or no search param
     * @param response contains a populated Image object
     * @param next method
     */
     module.exports.getImageObject=function(req, res, next) {
            if (req.params.id) {
                id = req.params.id;
                Image.findById(id, function (err, image) {
                    if (!err) {
                        //var base64img = new Buffer(image.img.data || '', 'binary').toString('base64');
                        //image.img.data=base64img;
                        res.send(image);
                        return next();
                    } else {
                        var errObj = err;
                        if (err.err) {
                            errObj = err.err;
                        }
                        return next(new restify.InternalError(errObj.message));
                    }
                });
            }
    }
    /**
     * Gateway request routes to other functions based on params
     * Search for a image by id or imagename
     * if none given get the logged in image's information
     *
     * @param request can include an id, a imagename or no search param
     * @param response contains a populated Image object
     * @param next method
     */
     module.exports.getImage=function(req, res, next) {
        var url = req.url;
        var id = url.substring(url.lastIndexOf("/")+1);
        if (id !== null && id !== '') {
            Image.findById(id, function (err, image) {
                if (!err) {
                    if(image) {
                        var img = new Buffer(image.img.data, 'base64');
                        res.writeHead(200, {
                            'Content-Type': image.img.contentType,
                            'Content-Length': img.length
                        });
                        res.end(img);
                        next();
                    }else{
                        return next(new restify.ResourceNotFoundError('Image not found.'));
                    }
                } else {
                    var errObj = err;
                    if (err.err) {
                        errObj = err.err;
                    }
                    return next(new restify.InternalError(errObj.message));
                }
            });
        }
    }

























