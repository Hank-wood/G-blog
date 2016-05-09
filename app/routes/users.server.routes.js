// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var users = require('../../app/controllers/users.server.controller'),
    passport = require('passport');

// Define the routes module' method
module.exports = function(app) {
    // Set up the 'signup' routes
    app.route('/sendmail')
        .get(users.sendmail);
    app.route('/signup')
        .get(users.renderSignup)
        .post(users.signup);

    // Set up the 'signin' routes
    app.route('/signin')
        .get(users.renderSignin)
        .post(passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/signin',
            failureFlash: true
        }));
    // Set up the 'users' base routes
    app.route('/api/users')
        .get(users.list)
        .post(users.create);

    // Set up the 'users' parameterized routes
    app.route('/api/users/:userId')
        .get(users.read)
        .put(users.requiresLogin, users.update)
        .delete(users.requiresLogin, users.delete);

    // Set up the Google OAuth routes
    app.get('/oauth/google', passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        failureRedirect: '/signin'
    }));
    app.get('/oauth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin',
        successRedirect: '/'
    }));

    // Set up the 'signout' route
    app.get('/signout', users.signout);
    app.param('userId', users.userByUsername);
};
