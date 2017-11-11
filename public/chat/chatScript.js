//allGood


var chatBoxSpawner = document.getElementById('chatBoxSpawner');


chatBoxSpawner.addEventListener('submit' , (x)=>{//err checked

    x.preventDefault();
    var form_id =  x.target.getAttribute('id');//have stored the username (i.e. unique) as id of the chat form as chatBoxID
    var friendName = form_id.substr(8); //id of each chat Form is set as chatForm + friendName

    var message = x.target.firstChild.value;//input box

    if (message){   //cant send ''
      socket.emit('message' , friendName , message , (x)=>{
        if (x.err){
            errorHandler(x.err , "message")
        }
      });
      x.target.firstChild.value = "";
    }
})


chatBoxSpawner.addEventListener('click' , (x)=> {
  //removing chatBox on clicking its header

    if(x.target.className == "chatHeaderClose"){

      var friendName  = x.target.parentNode.innerHTML;//name of friend is inscribed directly in div
      var chatContainer = x.target.parentNode.parentNode;

      chatContainer.parentNode.removeChild(chatContainer);

      socket.emit('leaveParty' , friendName , (err)=>{
        if(err){ errorHandler(err) }
      })

    }

})



socket.on('message' , function(message , to ){
      concurrentChatToView(message , to);
})


friendUlTag.addEventListener('click' , (x)=> {
    var target = x.target;

    if(target.className == "friendListItems"){      //if clicked on the li tag...

            var chatBoxSpawner_children = chatBoxSpawner.childNodes;  //array of opened chatBoxes ( first child is text Node)
            var target_name = x.target.firstChild.innerHTML;          //name of the friend in that ul tag (inside span tag)
            var index = 0;

            for(var i =1 ;  i < chatBoxSpawner_children.length ; i++){
              if (target_name == chatBoxSpawner_children[i].getAttribute('id').substr(13) ){ //e.g. chatContainerfoo .. only taking foo
                    index = i;
            }
        }
            if (index == 0){      //if index is still 0 chatBox containing that userName has not opened yet
              chatBoxFactory(x.target.firstChild.innerHTML);    //so create chatBox
              target.childNodes[1].classList.remove("unseenMessages") //removing the sign
            }
            else{

                //TODO bringFocus to the chatBox
            }

  }

})


function chatBoxFactory(friendName){

    var arr = [];
      for (var i of [1,2,3,4,5]){
        arr.push(document.createElement('div')) //create 5 divs
      }
      arr[0].className = 'chatContainer';
      arr[1].className = 'chatHeader';
      arr[2].className = 'chatBodyContainer';
      arr[3].className = 'chatBody';
      arr[4].className = 'chatFooter';

      arr[0].appendChild(arr[1]);
      arr[0].appendChild(arr[2]);
      arr[0].appendChild(arr[4]);
      arr[2].appendChild(arr[3]);

      arr[1].innerHTML = friendName;

      var span = document.createElement("span");
      span.innerHTML = "&#10006;";
      span.className = "chatHeaderClose";//close button for closing chatBox
      arr[1].appendChild(span);

      var form = document.createElement('form');
      var input = document.createElement('input');

      input.className = "chatBox";
      form.className = "chatForm";

      input.setAttribute('type',"text");

      form.setAttribute("id", 'chatForm'+friendName);
      arr[0].setAttribute("id" , 'chatContainer' + friendName)
      arr[3].setAttribute("id" , 'chatBody' +friendName)
      arr[2].setAttribute("id" , 'chatBodyContainer' + friendName)      //if used for loop and if statement to setAttribute then it will result in better performance

      form.appendChild(input);
      arr[4].appendChild(form);
      chatBoxSpawner.appendChild(arr[0]);
      console.log(chatBoxSpawner);
      setTimeout( ()=> fetchChatHistory(friendName) , 0 );

}



function fetchChatHistory(friendName){


  socket.emit('requestChatHistory' , friendName , function(err, response){

    if (err){
      errorHandler(err , "chatHistory");
      return;
    }

      var chatBodyContainer = document.getElementById('chatBodyContainer' + friendName);

        for(var each of response){
            appendChatToView(each , friendName)
      }
      chatBodyContainer.scrollTop = chatBodyContainer.scrollHeight - chatBodyContainer.clientHeight;//scrolling all the way down at start

  })

}



function appendChatToView(msg , friendName ){

    var chatBody = document.getElementById('chatBody' + friendName)

    if(chatBody){

        var nodes = chatBody.childNodes;
        var div = document.createElement("div");
        var span = document.createElement('span');

        span.appendChild(document.createTextNode(msg.text));

        div.appendChild(span);

        if(msg.name === friendName){
          span.className = "otherSpan";
          div.className = "otherDiv";
        }
        else{
          span.className = "selfSpan";
          div.className = "selfDiv";
        }
        if(chatBody.firstChild){  //appending as firstChild and column-reverse css takes it down at bottom
          chatBody.insertBefore(div , chatBody.firstChild)
        }
        else{
          chatBody.appendChild(div);
        }

  }
}


function concurrentChatToView(message , to ){//optional callback param
    var the_other_person ;
    if ( to === user.username){
        the_other_person  = message.name;//the other party sent it
    }
    else{
      the_other_person = to;        //this user sent it
    }
    appendChatToView(message , the_other_person);
    console.log(the_other_person);
    var chatBodyContainer = document.getElementById('chatBodyContainer' + the_other_person);
    chatBodyContainer.scrollTop = chatBodyContainer.scrollHeight - chatBodyContainer.clientHeight;
}
