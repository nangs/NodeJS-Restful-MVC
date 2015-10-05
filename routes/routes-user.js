
/**
 * User Routes module
 *    these routes require authenticated users
 */
var restify = require('restify')
    , config = require('../config/config').get()
    , config_path = config.root + '/config'
    , auth = require(config_path + '/middlewares/authorization.js')
    , userController= require('../controller/user');



module.exports = function (app, mailHelper) {

    userController.setMail(mailHelper);

    // Set up routes

    // I looked at versioning via header. Lots of arguments pro/con regarding different types of versioning
    // I like the embedded version (self documenting) so stuck with that instead
    // apt.get({path: 'api/user:id', version: '1.0.0'}, getUser_V1);
    // apt.get({path: 'api/user:id', version: '2.0.0'}, getUser_V2);

    /**
     * Search for users using the legal values in a userList object:
     *   name: { type: String, default: '' } // search name
     *   email: { type: String, default: '' } // search email
     *   username: { type: String, default: '' } // search username
     *   itemsPerPage: { type: Number, min: -1, default: -1} // number of records to return, -1 is unlimited
     *   pageNumber: { type: Number, min: -1, default: -1} // page number 1-N
     *   ascendingSortFlag: { type: Boolean, default: true }
     *   sortField: { type: String, default: '' }
     *
     * @param path Optional params: {}
     * @param promised callback check authorization
     * @param promised 2nd callback searches for users
     */
    app.get('/api/v1/userlist', auth.requiresLogin, userController.searchUsers);

    // TODO Need to figure out the explicit REST URI
    // confused, specified gets by id or username, seemed to be working
    // then started getting 405 GET not allowed ??
    //       app.get('/api/v1/user/:id', getUserById);
    //       app.get('/api/v1/user/:username', getUserByUsername);
    // so went back to a generic path
    /**
     * Search for users
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback gets user
     */
        // This one is takes no args/params and is for the client to retrieve the authenticated user's information
    app.get('/api/v1/user', auth.requiresLogin, userController.getUser);

    // get the user by id or username, only admin can do this
    app.get('/api/v1/user/:search', auth.adminAccess, userController.getUserByIdOrUsername);

    /**
     * Update user information
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback searches for users
     */
    app.put('/api/v1/user', auth.requiresLogin, userController.putUser);

    /**
     * Administrator updating user information
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback searches for users
     */
    app.put('/api/v1/admin/user', auth.adminAccess, userController.putUserByAdmin);

    // Delete
    // 405 ? app.del('/api/v1/admin/user/:id', deleteUser);
    /**
     * delete a user
     *
     * @param path
     * @param promised callback check Administrator auth
     * @param promised 2nd callback deletes
     */
    app.del('/api/v1/admin/user', auth.adminAccess, userController.deleteUser);

    /**
     * Update user image
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback searches for users
     */
    app.put('/api/v1/image/user', auth.requiresLogin, userController.putImage);
};
