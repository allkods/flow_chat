var mongoose=require('mongoose');

mongoose.connect("mongodb+srv://sssahilraj:test@cluster0-jmm4f.mongodb.net/flowchat?retryWrites=true&w=majority",{ useFindAndModify:false,useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
var drawRequestSchema= new mongoose.Schema({
    room_id:{
        type:String,
        required:true
    },
    sender:{
        type:String,
        required:true
    } 
});

const DrawRequest=mongoose.model('drawRequest', drawRequestSchema);
module.exports=DrawRequest;