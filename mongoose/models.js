var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var friendSchema = new Schema({
  friend:{
    type:String
  },
  unseenMessages:{
      type: Number,
      default: 0
  }
})



var userSchema = new Schema({
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


var textSchema = new Schema({
    name:{
      type: String
    },
    text:{
        type: String
    }

})

var chatSchema = new Schema({
    partyName:{
      type: String
    },
    chatHistory: [textSchema]

})



module.exports = {
  User : mongoose.model('User' , userSchema),
  Chat : mongoose.model('Chat' , chatSchema )
}
