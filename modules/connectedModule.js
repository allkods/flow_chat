var mongoose=require('mongoose');

mongoose.connect("mongodb+srv://sssahilraj:test@cluster0-jmm4f.mongodb.net/flowchat?retryWrites=true&w=majority",{ useFindAndModify:false,useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
var connectedSchema= new mongoose.Schema({
    socket_id:{
        type:String,
        required:true
    },
    uid:{
        type:String,
        required:true
    }
});

const Connected=mongoose.model('connected', connectedSchema);
module.exports=Connected;