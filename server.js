var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose'),
    User = require('./mongoose/models').User,
    Chat = require('./mongoose/models').Chat,
    path = require('path');
    chatRouter = require('./router/chat'),
    registerRouter = require('./router/register'),
    practiseRouter = require('./router/practise');

server.listen(process.env.PORT || 8080);

mongoose.connect('mongodb://jasmine:jasmine@ds227565.mlab.com:27565/abhaya_first_chatapp' , (err)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log('coonected to the mongodb database');
      }
});

app.use(bodyParser.urlencoded({ extended: true }));

var socketConnection  = require('./socketConnections/socket')(io);

app.use('/' , practiseRouter);
app.use('/chat' , chatRouter);
app.use('/register' , registerRouter);
app.use(function(req , res, next){
  res.sendFile( path.join(__dirname , 'public','page not found' , '404.html'))

});
