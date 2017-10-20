
var searchForm = document.getElementById('searchForm');
var searchArea = document.getElementById('searchArea');
var notificationButton = document.getElementById ('notificationButton')

 searchForm.addEventListener('submit' , (x)=>{
   x.preventDefault();
      if(searchArea.value != "" && searchArea.value != user.username){     // your friend cannot be empty or u urself

            socket.emit('addFriend' , searchArea.value,  (response)=> {
                if(response.err){
                  console.log(response.err)
                }
                searchForm.childNodes[1].value = "";
            })
      }

})

notificationButton.addEventListener('click' , (event)=>{

    if (notificationButton.classList.length == 1){
        notificationButton.classList.add("notificationButtonFalse"); //on clicking button alert is gone
    }

    if(event.target.className== "accept"){

      var requester = event.target.parentNode.parentNode.childNodes[0].innerHTML;
      acceptOrRejectFriend(requester , true)//if true do accepting process
    }

    if(event.target.className== "reject"){
        var requester = event.target.parentNode.parentNode.childNodes[0].innerHTML;
        acceptOrRejectFriend(requester , false)//if false do rejecting Process
    }


      var ulDisplay = notificationButton.childNodes[1].style.display;
      if(ulDisplay == "none" || ulDisplay==""){
          notificationButton.childNodes[1].style.display = "block";
      }
      else{
        notificationButton.childNodes[1].style.display = "none";
      }

})



var acceptOrRejectFriend = function(friendName , bool){

  if(bool){

      socket.emit('acceptFriend' , friendName , (response)=>{
        if (response.err){
          errorHandler(response.err);
          return;
        }


          var friends = response.friends;
          friendListAppender (friends.splice(friends.length -1 , 1));//only sending the latest friend to append

          dynamicNotification(response.pendingRequests , false);//false means dont make notification change color
      })
  }

  else{
      socket.emit('rejectFriend' , friendName , (response)=>{
          if (response.err){
            errorHandler(response.err);
            return;
          }
          dynamicNotification(response.pendingRequests  , false)
      })

  }

}
