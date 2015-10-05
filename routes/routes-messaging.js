
/**
 * Messaging Routes Module
 *   Requires authenticated users
 */
var restify = require('restify')
    , config = require('../config/config').get()
    , config_path = config.root + '/config'
    , auth = require(config_path + '/middlewares/authorization.js')
    , messagingController= require('../controller/messaging');

module.exports = function (app) {


    /**
     * Post a message thread
     *
     * @param path {message: '<text>', subject: '<subject>'}
     * @param promised callback check authorization
     * @param promised 2nd callback post
     */
    app.post('/api/v1/messageThread', auth.requiresLogin, messagingController.postMessageThread);

    /**
     * Update a message thread
     *
     * @param path {_id:'', modifyDate: '', fromArchiveFlag: '', toArchiveFlag: '', inappropriateFlag: messages: '' }
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.put('/api/v1/messageThread', auth.requiresLogin, messagingController.putMessageThread);

    /**
     * Get a message thread
     *
     * @param path { archiveFlag : "true|false"}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.get('/api/v1/messageThread', auth.requiresLogin, messagingController.getMessageThread);

    /**
     * Archive a message thread
     *
     * @param path {messageThreadId: '<id>'}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.del('/api/v1/messageThread', auth.requiresLogin, messagingController.archiveMessageThread);

    /**
     * Post a system message thread
     *
     * @param path {message: '<text>', subject: '<subject>'}
     * @param promised callback check admin access
     * @param promised 2nd callback post
     */
    app.post('/api/v1/systemMessage', auth.adminAccess, messagingController.postSystemMessage);

    /**
     * Get a message thread
     *
     * @param path {archiveFlag : true|false}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.get('/api/v1/systemMessage', auth.requiresLogin, messagingController.getSystemMessage);

    /**
     * Archive a message thread
     *
     * @param path {systemMessageId: '<id>'}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.del('/api/v1/systemMessage', auth.requiresLogin, messagingController.archiveSystemMessage);

    /**
     * Deletes a System Message by the administrator
     *
     * @param path {systemMessageId: '<id>'}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.del('/api/v1/systemMessage/delete', auth.adminAccess, messagingController.purgeSystemMessage);

};










