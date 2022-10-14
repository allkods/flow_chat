var mongoose=require('mongoose');

mongoose.connect("mongodb+srv://sssahilraj:test@cluster0-jmm4f.mongodb.net/flowchat?retryWrites=true&w=majority",{ useFindAndModify:false,useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
var chatroomSchema= new mongoose.Schema({
    users:{
        type:Array,
        required:true
    },
    records:{
        type:Array
    },
    last_msg:{
        type:Object
    },
    date:{
        type:Date,
        default:Date.now()
    }
});

const Chatroom=mongoose.model('chatroom', chatroomSchema);
module.exports=Chatroom;