/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/**
 * Beta Invite
 */
var BetaInviteSchema = new Schema({
  id: ObjectId
  , email: { type: String, trim: true, lowercase: true, required: true }
  , betaCode: { type: String, trim: true, required:'Beta Code is required.' }
})

/**
 * Validations
 */
var validatePresenceOf = function (value) {
  return value && (value.length > 6)
}

/**
 * Pre-save hook
 */
BetaInviteSchema.pre('save', function(next) {
  next();
})

module.exports = mongoose.model('BetaInvite', BetaInviteSchema)







