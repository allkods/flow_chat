var isAuth=require('../config/auth');
var Chatroom=require('../modules/chatrooModule');
var Users=require('../modules/UserModule');
module.exports=function(router){
router.get('/chat',isAuth,function(req,res){
   if(!req.user)
   res.redirect('/');
   var chatrooms=[];
   var chatusers=[];
   var dateTime=[];
   var sorted=[];
   var newchatusers=[];
   var newchatrooms=[];
   var unread=[];
   var newunread=[];
   var newuserdetails=[];
   Chatroom.find({users:{$all:[req.user.id]}},function(err,room){
      room.forEach(element => {
         element.users.pull(req.user.id);
         chatrooms.push({id:element.id,last_msg:element.last_msg});
         chatusers.push(element.users[0]);
         dateTime.push({id:element.id,date:element.last_msg.date});
         sorted.push(element.last_msg.date);
         var x=0;
         for(var i=0;i<element.records.length;i++){
            if(element.records[i].seen_by.indexOf(req.user.id)<0)
            x++;
         }
         unread.push(x);
      });
      sorted.sort(function(a,b){return b-a});
      var chatUsersDetail=[];
     Users.find({_id:chatusers},{name:1,status:1,imgid:1,gender:1},function(err,data){
          data.forEach(element => {
             chatUsersDetail.push(element);
          });
          for(var i=0;i<sorted.length;i++){
             var shuf1=dateTime[i];
             var xxy=sorted.indexOf(shuf1.date);
             newchatrooms[xxy]=chatrooms[i];
             newunread[xxy]=unread[i];
             newchatusers[xxy]=chatusers[i];
          }
          for(var i=0;i<chatUsersDetail.length;i++){
             var shuf1=chatUsersDetail[i];
             var xxy=newchatusers.indexOf(shuf1.id);
             newuserdetails[xxy]=chatUsersDetail[i];
          }
          res.render('chat',{user:req.user,color:global.color,chatrooms:newchatrooms,chatusers:newuserdetails,unread:newunread});
        
      }); 
      }); 
            
   }); 
   
   router.post('/chat/onlines',isAuth,function(req,res){
      var chatrooms=[];
      Chatroom.find({users:{$all:[req.user.id]}},function(err,data){
         data.forEach(element => {
            element.users.pull(req.user.id);
            chatrooms.push(element.users[0]);
         });
         var chatusers=[];
         Users.find({_id:{$in:chatrooms},status:'active'},{name:1,status:1,imgid:1},function(err,data){
             res.json(data);
         });
      });

   });

   router.post('/chat/search',isAuth,function(req,res){
      var val=req.body.data;
      if(val!=null){
      Users.find({$or:[{email:{$regex:val,$options:"gi"}},{name:{$regex:val,$options:"gi"}}]},{name:1,status:1,gender:1,imgid:1},function(err,data){
          res.json(data);
      });
   }else{
      res.end();
   }
   });
    router.post('/chat/createRoom',isAuth,function(req,res){
       var users=req.body;
       Chatroom.find({$and:[{users:users.user1},{users:users.user2}]},function(err,data){
         if(data!=''){
            res.json({data:data[0].id,action:'success'});
         }else{
            res.json({action:'create'});
         }
       });
    });

}