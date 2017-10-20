var express = require('express');
    router = express.Router();
var path = require('path');
var User = require('../mongoose/models').User;
var Chat = require('../mongoose/models').Chat;


router.use(express.static(path.join(__dirname , '..' , 'public','register')))//make sure the name of the file is index.html otherwise it wont serve

router.post('/' , function(req , res){
  if (req.body.username.length <= 5 || req.body.username.length >= 15){
        res.send("invalid username");
        return;
  }

  else if (req.body.password.length <=6){
        res.send("invalid password");
        return;
  }

  if(req.body.username === null || req.body.password === null){
      res.redirect('/register')
  }
        var user = new User({ username: req.body.username, password: req.body.password , friends:[]} )
        user.save( (err , user)=>{
            if(err){
              console.log(err)
              res.send("duplicate");
            }
            else{
              res.send("login");
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
