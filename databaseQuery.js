
var User = require('./mongoose/models').User;
var Chat = require('./mongoose/models').Chat;
const author = "Abhaya";

var verifyFunction = function(client , callback){


  User.findOne({username: client.username}, function(err, user){
        if (!user){
              callback({err: 100})
        }
        else{
              if (user.password === client.password){//true
                    user.changed = []; //we are sending everything at start so no need to trigger unnecessary future change
                    callback(user);
                    if (user.firstTime){
                      user.firstTime = false;
                      user.save();
                    }
                  }
                  else{
                    callback({err: 200})
                  }
            }
        })

}

var messageFunction = function(partyName , msg , callback){   //TODO

      Chat.findOne({partyName: partyName} , function(err , party){
          if(err){
            callback({err: 100})//trouble finding other party
          }
          else{
                party.chatHistory.push(msg)//push msg object into chathistory array
                party.save((err)=>{
                  if(err){    callback({err: 200}) }//couldnot send message
                  else{
                    callback(msg)
                  }
                })
          }

      })


}

var firstTimeUserFunction = function(user , callback){
    if (user.username == author){
          callback();
          return;
    }
    user.friends.push({ friend: author});
    User.findOne({ username: author} , (err , admin)=> {

            if (err){
                callback({err: 441}); //server restarted
                return;
            }
            admin.friends.push({friend: user.username});

            __chatPartyCreateFunction( author , user._id , user.username   , ()=>{
                    if(admin.changed.indexOf(2) == -1){
                      admin.changed.push(2);
                    }
                    admin.save( (err)=> {
                      if(!err){
                              user.save( (err)=>{
                                 if(!err){
                                   callback();
                                 }
                                else{
                                  callback({err: 441});
                                }
                              })
                      }
                      else{
                          callback({err: 441});
                      }

                    });
            })

    })
//var __chatPartyCreateFunction = function(friend, user_id , user_name, cb){  //create party helper


}








var addFriendFunction = function(requester , friendName , callback){//TODO

    User.findOne({username: requester} , function(err , user){


        var indexOf = true;
        for(var each of user.friends){
          if (each.friend == friendName ){   //check if friend is already added
            indexOf = false;
            break;
          }
        }

        if (!indexOf){
          callback({err:300})//check if friend is already added
        }

        else{
            User.findOne({username: friendName} , function(err, user){
                if(!user){// there is noone with that name
                    callback({err: 100})
                }
                else{

                    if(user.pendingRequests.indexOf(requester) != -1){
                      callback({err: 301})//request had already been sent
                    }
                    else{
                      user.pendingRequests.push(requester)

                      if(user.changed.indexOf(1) == -1){
                        user.changed.push(1);//1 suggests someone has requested him
                      }
                      user.save();
                      callback({err: null})

                    }

                }
            })
        }

    })

}


// *******************************************************************************************************************************
// *******************************************************************************************************************************
// *******************************************************************************************************************************
// *******************************************************************************************************************************


var routineQueryFunction = function(requester , callback){//returns pendingRequests if any

    var toReturn = []
    User.findOne({username:requester} , function(err , user){

      // if no user send a message saying you need to restart the page
        var unreadMessages = function(){
              var arr = [];
              for(var each of user.friends){
                  if(each.unseenMessages != 0){
                      arr.push(each)
                  }
              }
              return arr;
        }


        for( var each of user.changed){

                if(each == 1){
                    toReturn.push({pendingRequests: user.pendingRequests})
                }
                else if (each == 2){
                  toReturn.push({friends: user.friends})
                }

                else if(each == 3){
                    toReturn.push({pendingMessages: unreadMessages()})
                }

        }
        callback(toReturn)
        user.changed = [];
        user.save();

      })

  }


//returns acceptedFriend after adding in database
var acceptRejectFunction = function(acceptor , friendName , acceptor_id , bool , callback){ //TODO
  User.findOne({username: acceptor} , function(err , user){
       if(err){
          return;
       }
       else{
           var index = user.pendingRequests.indexOf(friendName);
            user.pendingRequests.splice(index , 1);

            var indexOf = true;
            for(var each of user.friends){
              if (each.friend == friendName ){    //making sure if invitationSender already in the  friendsList
                indexOf = false;
                break;
              }
            }

            if(indexOf){ //making sure if invitationSender already in the  friendsList

                if(bool){// accepting situation

                      user.friends.push({friend:friendName});// adding the invitationSender to my friends' lis

                      user.changed = [] //while send friends we also send the unseenMessages

                      callback({friends: user.friends , pendingRequests: user.pendingRequests});

                      User.findOne({username: friendName} , function(err, user){

                              if(err){
                                  return;
                              }
                              else{
                                user.friends.push({friend: acceptor});// adding the acceptor to my Friend's list

                                if(user.changed.indexOf(2) == -1){
                                    user.changed.push(2)
                                }
                                user.save();

                              }

                              setTimeout( ()=> __chatPartyCreateFunction( friendName , acceptor_id , acceptor, ()=>{}  ) , 0) //setTimeout to reduce the load in just one request
                      })

                }
                else{//this is rejectFriend Situation
                        user.changed.splice(1 , 1);
                        callback({pendingRequests: user.pendingRequests});
                }

            }
            else{ callback({err: 'friend already added'})}//friend exists already some bug
            user.save();//the acceptor
       }

  })

}



var fetchChatHistoryFunction = function(partyName , user_name , user_id , friendName , callback){//TODO ChatParty Create !!!!

      var __historyFetch = function(partyName , callback){

            Chat.findOne({partyName: partyName} , function(err , party){

                      if(err){
                        callback(null , {err:100});//couldnt get other party
                      }

                      else{
                                User.findOne({username: user_name}, function(err , user){

                                        if(err){
                                            callback(null , {err:200})//username dont exist
                                        }
                                        else{

                                            for(var each of user.friends){
                                                if(each.friend == friendName){
                                                    each.unseenMessages = 0;    //while fetching message will be seen so we can set it to 0
                                                    break;
                                                }
                                            }
                                            user.save();
                                            callback(party.chatHistory , null);
                                        }

                                } )

                      }
            })

    }

      if(partyName){

          var history  = __historyFetch(partyName , (response , err)=>{

                if (err){ callback(null , null ,null, err);}
                else{ callback(response , partyName , false , null); }//signal to not save the partyName

          });

      }

    else{
          __uniqueIdFinderFunction(user_name , user_id , friendName,
            (uniqueId , err)=>{
              if(err){ callback(null , null , null , err)};

              __historyFetch(uniqueId , (history , err)=>{

                  if (err){ callback(null , null ,null, err);}
                  else{ callback(history, uniqueId , true , null) } //callback Hell!! .. signal to save the partyName
            })

          });

    }

}



var unseenMessagesCounterFunction = function(self , friendName){

    User.findOne({username: friendName} , function(err , user){
          if(err){
              console.log(err)
          }
          else{
              for(var each of user.friends){

                  if(each.friend == self){
                      each.unseenMessages += 1;   //finds user increases unseenMessages
                      if(user.changed.indexOf(3) == -1){
                        user.changed.push(3)
                      }
                    break;
                  }
              }
              user.save();
          }

    })

}


/////////////////////////////////////////////////////// PRIVATE functions/////////////////////////////////////

//private function only to be used as a helper function for above database queries
var __chatPartyCreateFunction = function(friend, user_id , user_name, cb){  //create party helper

    __uniqueIdFinderFunction( user_name , user_id , friend , function(uniqueId , err){

            Chat.create({
                  partyName: uniqueId,
                  chatHistory: []
              } , function(err , party){
                          if(err){ console.log(err)}
                          cb();
            })

    });
}

var __uniqueIdFinderFunction =  function(user_name , user_id , friendName, callback ){//TODO

//creates unique name for party based on user database Id and other user username

  User.findOne({username: friendName}, (err, friendAccount)=>{
      if(!friendAccount){
          callback(null , {err:100})
      }
      else{

             var greaterName;
             var other_id;// alphabetically choosing name and choosing the id of the other party

             if(friendName > user_name){
                  greaterName = friendName;
                  other_id = user_id;
             }
             else{
                  greaterName = user_name;
                  other_id = friendAccount._id;
             }
             var uniqueId = greaterName + other_id;    //very unique party
             callback(uniqueId , null)

      }

    })

}



module.exports = {
  verify:verifyFunction,
  saveMessage: messageFunction,
  firstTimeUser: firstTimeUserFunction,

  addFriend: addFriendFunction,
  routineQuery: routineQueryFunction,
  acceptReject: acceptRejectFunction,

  fetchChatHistory : fetchChatHistoryFunction,
  unseenMessagesCounter: unseenMessagesCounterFunction,
}
