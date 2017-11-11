var express = require('express');
    router = express.Router();
var path = require('path');
var User = require('../mongoose/models').User;
var Chat = require('../mongoose/models').Chat;
var firstTimeUser = require ('../databaseQuery').firstTimeUser;

// msg -- 77 -- username or password not enoug length
// msg -- 88 -- username already exists

router.use(express.static(path.join(__dirname , '..' , 'public','register')))//make sure the name of the file is index.html otherwise it wont serve

router.post('/' , function(req , res){
    var username = req.body.username.trim();
    var validEntry = true;

    if (username <= 5 || req.body.username.length >= 15){
          validEntry = false;
    }

    else if (req.body.password.length <=6){
          validEntry = false;
    }

    if(username === null || req.body.password === null){
        validEntry = false;
    }

          if (validEntry){
                var user = new User({ username: username, password: req.body.password , friends:[]})
                user.save( (err)=> {
                  if (err){res.send({err:88}); return;}

                  firstTimeUser(user, (err)=>{
                    if (err){
                      res.send(err);
                    }
                    else{
                      res.json(200);
                    }
                  })


                })
          }

          else{
            res.send( { err: 77 })
          }

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
