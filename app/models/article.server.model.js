// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Define a new 'ArticleSchema'
var ArticleSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    content: {
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
    },
    url: String,
    tags: [],
    creator: String,
    role:Number
});

// Create the 'Article' model out of the 'ArticleSchema'
mongoose.model('Article', ArticleSchema);
