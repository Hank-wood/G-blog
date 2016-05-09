// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var User = require('mongoose').model('User'),
    passport = require('passport'),
    transporter = require('nodemailer').createTransport({
        service: 'Mailgun',
        auth: {
            user: 'postmaster@lujq.me',
            pass: 'password'
        }
    });

function registerMail(mail) {
    transporter.sendMail({
        from: 'Golmic注册系统 <no-reply@lujq.me>',
        to: mail,
        subject: 'Golmic注册成功！',
        //text: 'test message form mailgun',
        html: '你好！<br>你收到这封邮件是因为刚刚你在Golmic提交了注册申请。<br>请点击下面的链接完成注册，若链接无法点击，可以复制到浏览器中直接访问。<br>'
    }, function(err, response) {
        if (err) {
            res.send("Mail error.");
            //ret.message = "Mail error.";
        } else {
            res.send("成功");
            //ret.message = "Mail send.";
        }
    });
}
// Create a new error handling controller method
var getErrorMessage = function(err) {
    // Define the error message variable
    var message = '';
    // If an internal MongoDB error occurs get the error message
    if (err.code) {
        switch (err.code) {
            // If a unique index error occurs set the message error
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
                // If a general error occurs set the message error
            default:
                message = 'Something went wrong';
        };
    } else {
        // Grab the first error message from a list of possible errors
        for (var errName in err.errors) {
            console.log('err.message');
            if (err.errors[errName].message) message = err.errors[errName].message;
        };
        if (!message && err.message) {
            message = err.message;
        }
    }

    // Return the message error
    return message;
};
exports.sendmail = function(req, res) {
    registerMail('549559373@qq.com');
    // transporter.sendMail({
    //     from: 'Golmic博客系统 <no-reply@lujq.me>',
    //     to: '549559373@QQ.com',
    //     subject: '标题',
    //     //text: 'test message form mailgun',
    //     html: '<b>test message form mailgun</b>'
    // }, function(err, response) {
    //     if (err) {
    //         res.send("Mail error.");
    //         //ret.message = "Mail error.";
    //     } else {
    //         res.send("成功");
    //         //ret.message = "Mail send.";
    //     }
    // });
};
// Create a new controller method that renders the signin page
exports.renderSignin = function(req, res, next) {
    // If user is not connected render the signin page, otherwise redirect the user back to the main application page
    if (!req.user) {
        // Use the 'response' object to render the signin page
        res.render('signin', {
            // Set the page title variable
            title: 'Sign-in Form',
            // Set the flash message variable
            messages: req.flash('error') || req.flash('info')
        });
    } else {
        return res.redirect('/');
    }
};

// Create a new controller method that renders the signup page
exports.renderSignup = function(req, res, next) {
    // If user is not connected render the signup page, otherwise redirect the user back to the main application page
    if (!req.user) {
        // Use the 'response' object to render the signup page
        res.render('signup', {
            // Set the page title variable
            title: 'Sign-up Form',
            // Set the flash message variable
            messages: req.flash('error')
        });
    } else {
        return res.redirect('/');
    }
};
// Create a new controller method that creates new users
exports.create = function(req, res) {
    // If user is not connected, create and login a new user, otherwise redirect the user back to the main application page
    if (!req.user || req.user.username == 'golmic') {
        // Create a new 'User' model instance
        var user = new User(req.body);
        var message = null;

        user.provider = 'local';
        if (!req.user) {
            user.role = 0;
        };
        if (user.username == 'golmic') {
            user.role = 5;
        };
        // Try saving the new user document
        user.save(function(err) {
            // If an error occurs, use flash messages to report the error
            if (err) {

                // If an error occurs send the error message
                return res.status(400).send({
                    message: getErrorMessage(err)
                });
                // Use the error handling method to get the error message
                //var message = getErrorMessage(err);
                // Set the flash messages
                //req.flash('error', message);


                // Redirect the user back to the signup page
                //return res.redirect('/signup');
            }

            // If the user was created successfully use the Passport 'login' method to login
            req.login(user, function(err) {
                // If a login error occurs move to the next middleware
                if (err) return next(err);

                // Redirect the user back to the main application page
                return res.redirect('/');
            });
        });
    } else {
        console.log(req.user);
        return res.status(400).send({
            message: '你已经登录啦~ 所以不能再注册喽~'
        });
    }
};

// Create a new controller method that retrieves a list of users
exports.list = function(req, res) {
    // Use the model 'find' method to get a list of users
    User.find() /*.sort('-created').populate('creator', 'firstName lastName fullName')*/ .exec(function(err, users) {
        if (err) {
            // If an error occurs send the error message
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            // Send a JSON representation of the user
            res.json(users);
        }
    });
};

// Create a new controller method that returns an existing user
exports.read = function(req, res) {
    res.json(req.user);
};
exports.userByUsername = function(req, res, next, username) {
    User.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            return next(err);
        } else {
            req.user = user;
            next();
        }
    });
};
// Create a new controller method that updates an existing user
exports.update = function(req, res) {
    // Get the user from the 'request' object
    var user = req.user;

    // Update the user fields
    user.title = req.body.title;
    user.content = req.body.content;

    // Try saving the updated user
    user.save(function(err) {
        if (err) {
            // If an error occurs send the error message
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            // Send a JSON representation of the user
            res.json(user);
        }
    });
};

// Create a new controller method that delete an existing user
exports.delete = function(req, res) {
    // Get the user from the 'request' object
    var user = req.user;

    // Use the model 'remove' method to delete the user
    user.remove(function(err) {
        if (err) {
            // If an error occurs send the error message
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            // Send a JSON representation of the user
            res.json(user);
        }
    });
};
// Create a new controller method that creates new 'regular' users
exports.signup = function(req, res, next) {
    // If user is not connected, create and login a new user, otherwise redirect the user back to the main application page
    if (!req.user) {
        // Create a new 'User' model instance
        var user = new User(req.body);
        var message = null;

        // Set the user provider property
        user.provider = 'local';

        // Try saving the new user document
        user.save(function(err) {
            // If an error occurs, use flash messages to report the error
            if (err) {
                // Use the error handling method to get the error message
                var message = getErrorMessage(err);

                // Set the flash messages
                req.flash('error', message);

                // Redirect the user back to the signup page
                return res.redirect('/signup');
            }

            // If the user was created successfully use the Passport 'login' method to login
            req.login(user, function(err) {
                // If a login error occurs move to the next middleware
                if (err) return next(err);

                // Redirect the user back to the main application page
                return res.redirect('/');
            });
        });
    } else {
        return res.redirect('/');
    }
};

// Create a new controller method that creates new 'OAuth' users
exports.saveOAuthUserProfile = function(req, profile, done) {
    // Try finding a user document that was registered using the current OAuth provider
    User.findOne({
        provider: profile.provider,
        providerId: profile.providerId
    }, function(err, user) {
        // If an error occurs continue to the next middleware
        if (err) {
            return done(err);
        } else {
            // If a user could not be found, create a new user, otherwise, continue to the next middleware
            if (!user) {
                // Set a possible base username
                var possibleUsername = profile.username || ((profile.email) ? profile.email.split('@')[0] : '');

                // Find a unique available username
                User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
                    // Set the available user name
                    profile.username = availableUsername;

                    // Create the user
                    user = new User(profile);

                    // Try saving the new user document
                    user.save(function(err) {
                        // Continue to the next middleware
                        return done(err, user);
                    });
                });
            } else {
                // Continue to the next middleware
                return done(err, user);
            }
        }
    });
};

// Create a new controller method for signing out
exports.signout = function(req, res) {
    // Use the Passport 'logout' method to logout
    req.logout();

    // Redirect the user back to the main application page
    res.redirect('/');
};

// Create a new controller middleware that is used to authorize authenticated operations
exports.requiresLogin = function(req, res, next) {
    // If a user is not authenticated send the appropriate error message
    if (!req.isAuthenticated()) {
        return res.status(401).send({
            message: 'User is not logged in'
        });
    }

    // Call the next middleware
    next();
};
