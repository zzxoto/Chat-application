var express = require('express');
    router = express.Router();
var path = require('path');
// var User = require('../mongoose/models').User;


// router.use(express.static(path.join(__dirname , '..' , 'public')))//make sure the name of the file is index.html otherwise it wont serve

router.get('/' , function(req ,res, next){
  res.redirect('/register');
})
module.exports = router;
