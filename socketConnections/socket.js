
var query = require('../databaseQuery');
var serverRestartErr = {err: 441};

let ioEventHandling =  (io)=>{

    io.sockets.on('connection' , (socket)=>{

        socket.on('verify' , (user, callback)=>{    //checks if user exists
          query.verify( user , (x)=>{
            if (x.err){     //if err == 100-> user dont exist .. if err -- 200-> password doesnot match
              callback({err: x.err})
            }
                else{
                   socket._id = x._id//this is database id
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
              query.fetchChatHistory(partyName , socket.name, socket._id , friendName , (history , party , bool , err)=>{
                  if (err){ callback(err , null); return; }
                  socket.join(party)
                  if(bool){
                    socket.parties.push( {[friendName] : party}) //bool is the signal to save the partyName for future use
                  }
                    callback(null , history) //array of strings or empty array

              })

        })
///////////////////////////////////////////////////////////////////////////////////

        socket.on('message' , (friendName , message , callback)=>{
/**message is transmitted by a user then redistrubuted to everyone in the party.
  By everyone I mean sender and reciver since it is one to one chat Room.
  If the receiver is not in the party the message reciver recieves unseen Messagees**/

             if (!socket.name){ callback(serverRestartErr); return;}

              var partyName = '';
              for (var each  of socket.parties){

                  if((Object.keys(each)[0] == friendName)){//.keys return array of keys of the Object
                      partyName = each[friendName]
                      break;
                  }
              }

              if (!partyName){
                  callback({err: 100});//cant find other party
                  return
              }

              var msg = {name: socket.name , text: message};

              query.saveMessage(partyName , msg , (x)=>{
                  if(x.err){
                    callback({ err: x.err});
                  }
                  else{

                        io.in(partyName).emit('message' , msg , friendName ) //have to also pass friendName becaue a user is connected to many channels and both the parties should know the name of the person at the other end of communicatoin

                        var room = io.sockets.adapter.rooms[partyName];


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
