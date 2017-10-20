var express = require('express');
    router = express.Router();
var path = require('path');
// var User = require('../mongoose/models').User;


router.use(express.static(path.join(__dirname , '..' , 'public','chat')))//make sure the name of the file is index.html otherwise it wont serve



module.exports = router;
