var xhttp = new XMLHttpRequest();
var inputs = document.getElementsByTagName("Input");
var form = document.getElementsByTagName("form")[0];
var errDisplay = document.getElementById("errDisplay");


form.addEventListener("submit" , function(x){// submit button
    x.preventDefault();
    var username = inputs[0].value.trim();
    var password = inputs[1].value;
    if (username.length <5 ){
        alert(" username must be more than 5");
    }
    else if(password.length <=6){
        alert("password must be at least 7 characters")
    }
    else{
          // xhttp.open("POST", "https://abhaya-chat-as-you-like.herokuapp.com/register", true);
          xhttp.open("POST", "http://localhost:8080/register", true);

          xhttp.onreadystatechange = register_response;

          xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhttp.send('username=' + encodeURIComponent(username)+"&password="+encodeURIComponent(password));
    }


})


function register_response(){


    if (this.readyState == 4 && this.status == 200) {

      var response = JSON.parse(this.response);
      var err = response.err;

      if (err){
            var errMessage = "";

            if (err == 77){
                errMessage = "Username or password doesnot fulfill the requirement";
            }
            if (err == 88){
              errMessage = "Username already exists";
            }

            errDisplay.innerHTML = errMessage;
            errDisplay.style.display = "block";
      }

      else{
        // window.location.href = "https://abhaya-chat-as-you-like.herokuapp.com/chat";
        window.location.href = "http://localhost:8080/chat"
      }

  }


}
