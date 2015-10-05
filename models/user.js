
/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId
    , crypto = require('crypto');

/**
 * User Schema
 */
var requiredErroMessage='{PATH} is required.';
var UserSchema = new Schema({
    id: ObjectId
    , name: { type: String, trim: true, required: requiredErroMessage  }
    , username: { type: String, trim: true, lowercase: true, required: requiredErroMessage, unique: true }
    , phoneNumber: { type: String, trim: true, required: requiredErroMessage , unique: true }
    , hashed_password: { type: String, trim: true }
    , tempPasswordFlag: { type: Boolean, default: false }
    , email: { type: String, trim: true, lowercase: true, required: requiredErroMessage, unique: true }
    , newEmail: { type: String, trim: true, lowercase: true, default: '' }
    , emailValidatedFlag: { type: Boolean, default: false }
    , role: { type: String, enum: ['User', 'Subscriber', 'Admin'], default: 'User', required: requiredErroMessage }
    , update_date: { type: Date, default: Date.now}  //Create_date 通过objectId可以得到 id.getTimesstamp()
    , score: { type: Number, default:0 , min: 0}  // 保存时，需要在 前段校验 delete user['score']， 防止恶意篡改积分
    , imageId:{ type: ObjectId }  //外键引入图片表内某一项
})


/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function() { return this._password })

/**
 * Validations
 */


var validatePresenceOf = function (value) {
    return value && value.length
};
var validateEmail =function(email) {
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return filter.test(email);
};

// tried these formats, always get the generic message

UserSchema.path('phoneNumber').validate(function (value) {
    return !(value.length!=11||isNaN(value))
}, 'Phone number must be valid.')
UserSchema.path('email').validate(function (value) {
    return validateEmail(value)
}, 'Email address must be valid.')
UserSchema.path('newEmail').validate(function (value) {
    if(!value)return true;
    return validateEmail(value)
}, 'New email address must be valid.')
UserSchema.path('hashed_password').validate(function (value) {
    if (!this.isNew)return true;
    return validatePresenceOf(this.password);
}, 'Password is required.')

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {

    this.update_date=Date.now; //重写update_date属性，防止恶意篡改更新日期
    next();
})

/**
 * Methods
 */

UserSchema.methods = {

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return ''
        return crypto.createHmac('sha1', this._id.toString()).update(password).digest('hex'); // using the ObjectId as the salt
    },

    /**
     * allowAccess
     *
     * @param {String} role
     * @return {Boolean}
     * @api public
     */
    allowAccess: function(role) {
        if (this.role == 'Admin') return true; // Admin can access everything
        if (role == 'Subscriber' && this.role == 'Subscriber') return true; // Subscriber can access Subscriber and User
        if (role == 'User' && (this.role == 'User' || this.role == 'Subscriber')) return true; // user is at the bottom of special access
        return false; // should only happen if checking access for an anonymous user
    }
}

mongoose.model('User', UserSchema)




