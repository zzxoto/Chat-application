var express = require('express');
    router = express.Router();
var path = require('path');
var User = require('../mongoose/models').User;
var Chat = require('../mongoose/models').Chat;

// msg -- 77 -- username or password not enoug length
// msg -- 88 -- username already exists

router.use(express.static(path.join(__dirname , '..' , 'public','register')))//make sure the name of the file is index.html otherwise it wont serve

router.post('/' , function(req , res){
    var username = req.body.username.trim();
    if (username <= 5 || req.body.username.length >= 15){
          res.send( {err: 77});
          return;
    }

    else if (req.body.password.length <=6){
          res.send( { err: 77 });
          return;
    }

    if(username === null || req.body.password === null){
        res.send( { err: 77 })
    }
          var user = new User({ username: username, password: req.body.password , friends:[]} )
          user.save( (err , user)=>{
              if(err){
                res.send({ err: 88});
                console.log(err);
              }
              else{
                res.json(200);
              }
          })
})


router.get('/drop' , function(req , res, next){

  User.remove({}, function(err, x) {            //drop collection entirely
    if (err) {
      console.log("Collection couldn't be removed" + err);
      return;
      res.json(err)
    }
        Chat.remove({} , function(err , x){
          if (err) {
            console.log("Collection couldn't be removed" + err);
            return;
            res.json(err)
          }
          else{
            res.redirect('/register')
          }
        })
  })

})




module.exports  = router;
