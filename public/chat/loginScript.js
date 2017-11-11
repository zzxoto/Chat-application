var user ;
var socket = io.connect();

var loginForm = document.getElementById('loginForm');//TODO remove listener
var loginUsername = document.getElementById('lu');
var loginPassword = document.getElementById('lp')

var loginContainer = document.getElementById('loginContainer');
var searchAndChatContainer = document.getElementById('searchAndChatContainer');

var  friendUlTag   = document.getElementById("friendsList").childNodes[1];
var firstTimeMessageClose = document.getElementById("firstTimeMessageClose");
var friendUlTagArray ;

loginForm.addEventListener('submit' , (x)=>{ //err Checked

    x.preventDefault();
    let userObject = {
      username: loginUsername.value,
      password: loginPassword.value
    }

    socket.emit('verify' , userObject , function(response){
        if (response.err){
            errorHandler(response.err , 'login');
            return;
        }
        user = response;

        if (user.firstTime){
           document.getElementById("firstTimeUserMessage").style.display = "block"
         }

        loginContainer.style.display = "none";
        searchAndChatContainer.style.display = "flex";
        document.getElementById('usernameGoesHere').innerHTML = user.username
        setTimeout( ()=> {recursiveQuery(); dynamicNotification(user.pendingRequests , true); friendListAppender(user.friends);} , 0)//after user logs in start querying database

    })

})

var  recursiveQuery = function(){//error checked

      var routineQuery = function(){//error checked

          socket.emit('routine' , (response)=>{//error checked
              if (response.err){
                  errorHandler(response.err , 'routine');
              }
              else{
                  for(var each of response){//response is array of objects
                        if(each.pendingRequests){
                            dynamicNotification(each.pendingRequests , true);//true means change the css to alert the user
                        }
                        if(each.friends){
                            friendListAppender(each.friends.splice(each.friends.length -1 , 1)); //TODO !!!! Error may arise in future if more than one friends accept within 5 seconds

                        }
                        if(each.pendingMessages && !each.friends){//if each.friends is alrady sent by the server side then the unseen messages has been added already
                            unseenMessagesNotifier(each.pendingMessages , null)//null means we dont know the li tag where the pendingMessages should go
                        }

                  }
              }
          })
          recursiveQuery();
      }

    setTimeout( routineQuery , 5000 )// after 5 seconds it querys the data base
}


function dynamicNotification( requests, bool ){


    var ulContainer = document.getElementById('notificationUl')

    while (ulContainer.firstChild) {
      ulContainer.removeChild(ulContainer.firstChild);
    }

    for (var i=0; i < requests.length ; i++){
        if(i == 0){
            if(bool){
              notificationButton.classList.remove("notificationButtonFalse"); //if there is even 1 requests then change the background color to red to alert user
            }
        }

        var li = document.createElement('li');
        var span = document.createElement('span');
        var div = document.createElement ('div');
        var button0 = document.createElement ('button');
        var button1 = document.createElement ('button');

        button0.className = "accept";
        button1.className = "reject";

        div.appendChild(button0);
        div.appendChild(button1);

        span.innerHTML = requests[i];

        ulContainer.appendChild(li);
        li.appendChild(span);
        li.appendChild(div);

    }

}


function friendListAppender(friends){

  for(var each of friends){
      var li = document.createElement('li')
      li.className = "friendListItems";

      var spanName = document.createElement('span')
      spanName.innerHTML = each.friend          //each is object of { friend: String , pendingMessages: number }
      li.appendChild(spanName)

      var spanNumber = document.createElement('span');
      li.appendChild(spanNumber)    //TODO add css class***********************************************

      if(each.unseenMessages > 0){
          unseenMessagesNotifier( each, spanNumber)
          spanNumber.className = "unseenMessages unseenMessagesZero";
      }
        friendUlTag.appendChild(li)
  }
  friendUlTagArray = Array.prototype.slice.call(document.querySelectorAll(".friendListItems"));

}
/*
@param friend_friendList: could be friend or array of friends
@param numberContainer: suitable span tag for that friend or null
*/
function unseenMessagesNotifier(friend_friendList , numberContainer){


    if(numberContainer){
        numberContainer.innerHTML = friend_friendList.unseenMessages;
    }

    else{
          //friend_friendList is array of friends whose unseenMessages is to be added

            var names = friendUlTagArray.map( x=> x.firstChild.innerHTML)
            for(var friend of friend_friendList){
                  var spanTagContainer = friendUlTagArray[names.indexOf(friend.friend)].childNodes[1]
                  spanTagContainer.innerHTML = friend.unseenMessages;     //insert unseen messages in the numberContainer
                  spanTagContainer.className = "unseenMessages unseenMessagesZero"
            }
        }
    }


    function errorHandler(err , from){

      if ( err instanceof(Object) ){
        err = err.err;
      }

      if(err == 441){
          alert("Not sync with server .. Reloading page");
          location.reload();
      }
      if (from){
            if (from == "login"){
                var loginErr = document.getElementById("errDisplay");
                if (err == 200){
                    loginErr.innerHTML = ('Password dont match');
                    console.log(loginErr)
                }
                if(err == 100){
                    loginErr.innerHTML = ('User dont exist');
                }
            }

            if (from == "message"){
                if (err == 100){
                    console.log("trouble finding other party");
                }
                if(err == 200){
                    console.log("couldnot send message");
                }
            }

            if (from == "chatHistory"){
                if (err == 100){
                      //couldnt locate that friend try again
                }
                if (err == 200){
                  //user dont exist on database
                }
            }


      }

    }


firstTimeMessageClose.addEventListener("click" , (x)=>{
    x.target.parentNode.style.display = "none";
})
