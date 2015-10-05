
/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId
    , config = require('../config/config').get();

/**
 * Image Schema
 */
var ImageSchema = new Schema({
    id: ObjectId
    , img: { data: { type: Buffer, required:'Image cannot be blank'} ,
        contentType:  { type: String, trim: true, lowercase: true, default: 'image/png' }
    }
    , update_date: { type: Date, default: Date.now}  //Create_date 通过objectId可以得到 id.getTimesstamp()
})

/**
 * Validations
 */
var validatePresenceOf = function (value) {
    return value && value.length
}

ImageSchema.path('img.contentType').validate(function (value) {
    return value.indexOf('image/')!=-1
}, 'please upload an image.')
ImageSchema.path('img.data').validate(function (value) {
    return value.length<config.imageSetting.profileImageMaxSize
}, 'Image is too big.')
/**
 * Pre-save hook
 */
ImageSchema.pre('save', function(next) {
    this.update_date=Date.now; //重写update_date属性，防止恶意篡改更新日期
    next();
})

/**
 * Methods
 */
ImageSchema.methods = {

}

mongoose.model('Image', ImageSchema)




