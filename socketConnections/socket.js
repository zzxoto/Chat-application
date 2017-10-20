
var query = require('../databaseQuery');
var serverRestartErr = {err: "Server restarted"}

let ioEventHandling =  (io)=>{

    io.sockets.on('connection' , (socket)=>{

        socket.on('verify' , (user, callback)=>{    //checks if user exists
          query.verify( user , (x)=>{
                if(x.err === 100){
                  callback({err: 'user doesnot exist'})
                }
                else if(x.err === 200){
                    callback({err: 'password didnot match' })
                }
                else{
                   socket._id = x._id
                   socket.name = x.username
                   socket.parties = [];
                   callback(x)//x is object that posesses the user credentials
                }
          })//query.verify

        })//socket.on('verify')
///////////////////////////////////////////////////////////////////////////////




        socket.on('requestChatHistory' , function(  friendName , callback ){
              if (!socket.name){ callback(serverRestartErr); return;}

              var partyName = '';

              for (var each  of socket.parties){

                  if(Object.keys(each)[0] == friendName){
                      partyName = each[friendName]
                      break;
                  }
              }
              query.fetchChatHistory(partyName , socket.name, socket._id , friendName , (history , party , bool)=>{

                  socket.join(party)
                  if(bool){
                    socket.parties.push( {[friendName] : party}) //bool is the signal to save the partyName for future use
                  }
                    callback(history) //array of strings or empty array

              })

        })
///////////////////////////////////////////////////////////////////////////////////

        socket.on('message' , (friendName , message)=>{
             if (!socket.name){ callback(serverRestartErr); return;}

              var partyName = '';
              for (var each  of socket.parties){

                  if((Object.keys(each)[0] == friendName)){//.keys return array of keys of the Object
                      partyName = each[friendName]
                      break;
                  }
              }

              if (!partyName){
                  console.log('something wrong message socket')
                  return
              }

              var msg = {name: socket.name , text: message}

              query.saveMessage(partyName , msg , (x)=>{
                  if(x.err){
                    console.log(x.err)
                  }
                  else{

                        io.in(partyName).emit('message' , msg , friendName ) //have to also pass friendName becaue a user is connected to many channels and both the parties should know the name of the person at the other end of communicatoin

                        var room = io.sockets.adapter.rooms[partyName];
                        console.log(room.length ,'room length' , socket.name)

                        if(room.length < 2){
                            query.unseenMessagesCounter(socket.name , friendName)
                        }
                  }
              })

        })


        socket.on('addFriend' , (toBeAdded , callback)=>{
            if (!socket.name){ callback(serverRestartErr); return;}

            query.addFriend(socket.name , toBeAdded , (response)=>{

                if(!response.err){
                  callback({err: null})
                }
                else if(response.err == 100){//// there is noone with that name
                  callback({err: 'user with that name  doesnot exists'})
                }
                else if(response.err == 300){//already added to the friend's list
                  callback({err: 'person is in friendList'})

                }
                else if(response.err == 301){//request already sent
                    callback({err: 'request already sent'})
                }


            })

          })//addFriend

          socket.on('leaveParty' ,  (friendName)=>{
              if (!socket.name){ callback(serverRestartErr); return;}

                var partyName = '';
                for (var each  of socket.parties){

                    if(Object.keys(each)[0] == friendName){
                        partyName = each[friendName]
                        break;
                    }
                }

                if(partyName){
                    socket.leave(partyName)
                }

          })


        socket.on('routine' , (callback)=>{
            if (!socket.name){ callback(serverRestartErr); return;}
            query.routineQuery(socket.name , (response)=>{

                callback(response); //array of appropriate changed values either pendingRequests or friends or unreadMessages or empty
            })
        })

        socket.on('acceptFriend' , (friendName , callback)=>{
          if (!socket.name){ callback(serverRestartErr); return;}

            query.acceptReject(socket.name , friendName , socket._id , true , (response)=>{
                callback(response);

            })
        });

      socket.on('rejectFriend' , (friendName , callback)=>{
          if (!socket.name){ callback(serverRestartErr); return;}

          query.acceptReject(socket.name , friendName , socket._id , false , (response)=>{
              callback(response);
          })

      });

    })//io.sokects.on('connection')

 /////////////////////////////////////////////////////////////////////////////////////////////////



}//ioEventHandling




module.exports = ioEventHandling;
