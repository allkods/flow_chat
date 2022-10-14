var mongoose=require('mongoose');

mongoose.connect("mongodb+srv://sssahilraj:test@cluster0-jmm4f.mongodb.net/flowchat?retryWrites=true&w=majority",{ useFindAndModify:false,useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
var userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true 
    },
    password:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        default:'user'
    },
    gender:{
        type:String,
        required:true
    },
    imgid:{
      type:String,
      default:''
    },
    date:{
        type:Date,
        default:Date.now()
    },
    status:{
        type:String,
        default:"offline"
    }
});

const User=mongoose.model('users', userSchema);
module.exports=User;