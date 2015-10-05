
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/**
 * Verify Code is used to validate new accounts/email addresses
 */

var VerifyCodeSchema = new Schema({
  id: ObjectId
  , userObjectId: ObjectId
  , key: { type: String, trim: true }
})

/**
 * Validations
 */
var validatePresenceOf = function (value) {
  return value && (value.length >= 12)
}
VerifyCodeSchema.path('key').validate(function (value) {
  return value && (value.length >= 12)
}, 'Invalid key.')
/**
 * Pre-save hook
 */
VerifyCodeSchema.pre('save', function(next) {

  next();
})


mongoose.model('VerifyCode', VerifyCodeSchema)



