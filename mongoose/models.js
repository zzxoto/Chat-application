var mongoose = require('mongoose');


var friendSchema = mongoose.Schema({
  friend:{
    type:String
  },
  unseenMessages:{
      type: Number,
      default: 0
  }
})



var userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:{
      type:String,
      required: true
    },

    friends: [friendSchema],

    pendingRequests:{
      type:[String],
      default: []//value is pushed to the array when someone sends us request
    },
    changed:{
      type: [Number],
      default: []
    }

})


var textSchema = mongoose.Schema({
    name:{
      type: String
    },
    text:{
        type: String
    }

})

var chatSchema = mongoose.Schema({
    partyName:{
      type: String
    },
    chatHistory: [textSchema]

})



module.exports = {
  User : mongoose.model('User' , userSchema),
  Chat : mongoose.model('Chat' , chatSchema )
}
