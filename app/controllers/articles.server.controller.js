// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
    Article = mongoose.model('Article'),
    markdown = require('markdown').markdown,
    path = require('path'),
    fs = require('fs');

// Create a new error handling controller method
var getErrorMessage = function(err) {
    if (err.errors) {
        for (var errName in err.errors) {
            if (err.errors[errName].message) return err.errors[errName].message;
        }
    } else {
        return 'Unknown server error';
    }
};

// Create a new controller method that creates new articles
exports.create = function(req, res) {
    // Create a new article object
    var article = new Article(req.body);

    // Set the article's 'creator' property
    //article.creator = req.user;

    // Try saving the article
    article.save(function(err) {
        if (err) {
            // If an error occurs send the error message
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            // Send a JSON representation of the article 
            res.json(article);
        }
    });
};
exports.upload = function (req, res, next) {
    var file = req.files.file;
  var targetPath = path.join(path.dirname(__dirname), '../public/image/') + file.name;
  //copy file
  fs.createReadStream(file.path).pipe(fs.createWriteStream(targetPath));
  fs.unlinkSync(file.path);
  //fs.unlinkSync(targetPath);
    console.log(targetPath); //original name (ie: sunset.png)
    res.send('dd');
};
// Create a new controller method that retrieves a list of articles
exports.list = function(req, res) {
    // Use the model 'find' method to get a list of articles
    Article.find().sort('-created').exec(function(err, articles) {
        if (err) {
            // If an error occurs send the error message
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            for (var i in articles) {
                articles[i].content = markdown.toHTML(articles[i].content);
                articles[i].content = articles[i].content.substr(0,200);
            };
            // Send a JSON representation of the article 
            res.json(articles);
        }
    });
};

// Create a new controller method that returns an existing article
exports.read = function(req, res) {
    req.article.content = markdown.toHTML(req.article.content);
    res.json(req.article);
};
exports.readMD = function(req, res) {
    res.json(req.article);
};

// Create a new controller method that updates an existing article
exports.update = function(req, res) {
    // Get the article from the 'request' object
    var article = req.article;

    // Update the article fields
    article.title = req.body.title;
    article.content = req.body.content;

    // Try saving the updated article
    article.save(function(err) {
        if (err) {
            // If an error occurs send the error message
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            // Send a JSON representation of the article 
            res.json(article);
        }
    });
};

// Create a new controller method that delete an existing article
exports.delete = function(req, res) {
    // Get the article from the 'request' object
    var article = req.article;

    // Use the model 'remove' method to delete the article
    article.remove(function(err) {
        if (err) {
            // If an error occurs send the error message
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            // Send a JSON representation of the article 
            res.json(article);
        }
    });
};
/*
// Create a new controller middleware that retrieves a single existing article
exports.articleByID = function(req, res, next, url) {
    // Use the model 'findById' method to find a single article 
    Article.findOne({
        url: url
    }).exec(function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + url));

        // If an article is found use the 'request' object to pass it to the next middleware
        req.article = article;

        // Call the next middleware
        next();
    });
};*/
exports.articleByID = function(req, res, next, id) {
    // Use the model 'findById' method to find a single article 
    Article.findById(id).populate('creator', 'firstName lastName fullName').exec(function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));

        // If an article is found use the 'request' object to pass it to the next middleware
        req.article = article;

        // Call the next middleware
        next();
    });
};

// Create a new controller middleware that is used to authorize an article operation 
exports.hasAuthorization = function(req, res, next) {
    // If the current user is not the creator of the article send the appropriate error message
    if (req.article.creator !== req.user.username) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }

    // Call the next middleware
    next();
};
