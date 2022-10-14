var mongoose=require('mongoose');

mongoose.connect("mongodb+srv://sssahilraj:test@cluster0-jmm4f.mongodb.net/flowchat?retryWrites=true&w=majority",{ useFindAndModify:false,useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
var drawSchema= new mongoose.Schema({
    room_id:{
        type:String,
        required:true
    },
    users:{
        type:Array,
    },
    time:{
        type:Date,
        required:true
    }
});

const Draw=mongoose.model('draw', drawSchema);
module.exports=Draw;