//setting up express
var express=require('express');
const app= express();
//including dependencies
var bodyParser=require('body-parser');
const session=require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash=require('connect-flash');
var passport=require('passport');
var socket=require('socket.io');
var fileupload=require('express-fileupload');
var mongoose=require('mongoose');
app.use(fileupload());

//importing Controllers
var index=require('./controllers/index');
var signup=require('./controllers/signup');
var chat=require('./controllers/chat');
//importing database module
var User=require('./modules/UserModule');
var ChatRooModule=require('./modules/chatrooModule');
var Connected=require('./modules/connectedModule');
var Draw=require('./modules/DrawModule');
var DrawRequest=require('./modules/DrawRequest');

//connect bodyParser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//setting view engine
app.set('view engine','ejs');

//settting up static path
app.use(express.static('./public'));

//connect flash
app.use(flash());

//Express session
mongoose.connect(
    "replace_this_with_mongoDB_connection_url_string",
    { useUnifiedTopology: true, useNewUrlParser: true }
    );
app.use(session({
    secret:'session-secret',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave:true,
    saveUninitialized:true
}));

//passsport Strategy
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


//global variables
app.use((req,res,next)=>{
    res.locals.success_msg= req.flash('success_msg');
    res.locals.error= req.flash('error');
    res.locals.updateDp=req.flash('updateDp');
    next();
});

const port=process.env.PORT || 8080;
//starting port
var server=app.listen(port,function(err,data){
    console.log("server is running");
});

//color style for css
global.color={male:'indigo',female:'crimson'}

//triggering routes
index(app);
signup(app);
chat(app);

// empty check function
function emptyCheck(data){
var emptyCheck;
if(data=='')emptyCheck='';else if(data==null)emptyCheck=null;else if(data=='undefined')emptyCheck='undefined';
return emptyCheck;
}
//....................../
//getting date function//
function getDate(data){
    var date=new Date(data);
    date=date.getFullYear()+'-'+date.getMonth()+1+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    return date;
}

var io=socket(server);
var users={};
io.on('connection',function(socket){
    
    socket.on('online',function(user){
        User.updateOne({_id:user.id},{$set:{status:'active'}},{new:true},function(err,data){

        });
        ChatRooModule.find({users:{$all:[user.id]}},function(err,data){
            data.forEach(element => {
            socket.join(element.id);
           // socket.broadcast.in(element.id).emit("online",user);
        });

        });
        Connected.updateOne({uid:user.id},{$set:{socket_id:socket.id}},{upsert:true},function(err,data){

        });
    });
    socket.on('new user',function(room,uid){
        ChatRooModule.find({_id:room},function(err,data){
            if(data!=emptyCheck(data)){
            var x=data[0].users;
            Connected.findOne({socket_id:socket.id},function(err,user){
                if(user!=emptyCheck(user)){
                if(x.indexOf(user.uid) != -1){
                   ChatRooModule.find({_id:room},{records:1},function(err,data){
                          io.sockets.in(room).emit("chat history",data,user.uid);
                   });
                }
             }
            });
          }
        });
    });
    socket.on('read',function(room){
        Connected.findOne({socket_id:socket.id},function(err,user){
         if(user!=emptyCheck(user)){
         ChatRooModule.updateOne({_id:room,records: {$elemMatch: {uid:{$ne:user.id}, seen_by:{$ne:user.uid}}}},{$push:{'records.$[].seen_by':user.uid,$slice:-2}},function(err,data){
                       
        });
     }
    });
    });
    
    socket.on('new message',function(msg,room){
        if(msg!=''){
        ChatRooModule.find({_id:room},function(err,data){
           if(data!=emptyCheck(data)){
                var x=data[0].users;
                Connected.findOne({socket_id:socket.id},function(err,user){
                    if(user!=emptyCheck(user)){
                    if(x.indexOf(user.uid) != -1){
                        ChatRooModule.updateOne({_id:room},{$push:{records:{uid:user.uid,message:msg,date:Date.now(),seen_by:[user.uid]}},$set:{last_msg:{uid:user.uid,message:msg,date:Date.now()}}},{upsert:true},function(err,data){
                                io.sockets.in(room).emit("new message",{msg:msg,date:getDate(Date.now())},user.uid,room,false);
                        });
                    }
                }
                });
            }else{
                User.findById(room,function(err,user2){
                   if(user2!=emptyCheck(user2)){
                        Connected.findOne({socket_id:socket.id},function(err,user1){
                            if(user1!=emptyCheck(user1)){
                                ChatRooModule.findOneAndUpdate({$or:[{users:[user1.uid,user2.id]},{users:[user2.id,user1.uid]}]},{$set:{users:[user1.uid,user2.id],last_msg:{uid:user1.uid,message:msg,date:Date.now()}},$push:{records:{uid:user1.uid,message:msg,date:Date.now(),seen_by:[user1.uid]}}},{upsert:true,new:true},function(err,room){
                                    
                                    socket.join(room.id);
                                    Connected.findOne({uid:room.users[1]},function(err,user2){
                                           if(user2!=emptyCheck(user2)){
                                           var soc = io.sockets.connected[user2.socket_id];
                                           soc.join(room.id);
                                        }
                                    //  ChatRooModule.updateOne({room_id:room.id},{$push:{records:{uid:room.users[0],message:msg}}},{upsert:true},function(err,data){
                                       io.sockets.in(room.id).emit("new message",{msg:msg,date:getDate(Date.now())},room.users[0],room.id,true);
                                          User.find({_id:{$in:[room.users[0],room.users[1]]}},{name:1,gender:1,imgid:1,email:1},function(err,bothUser){
                                              var sender,receiver;
                                              bothUser.forEach(element => {
                                                  if(element.id==room.users[0])
                                                  sender=element;
                                                  else
                                                  receiver=element;                                               
                                              });
                                             io.sockets.in(room.id).emit("new room created",sender,receiver,room.id,{msg:msg,date:getDate(Date.now())});
                                          });
                                     //  }); 
   
                                    });
                            });
                            }

                        });
                    }
                })

            }
        });
      }
    });
    socket.on("typing",function(user,room){
        ChatRooModule.find({_id:room},function(err,data){
           if(data!=emptyCheck(data)){
                var x=data[0].users;
                Connected.findOne({socket_id:socket.id},function(err,data){
                    if(data !=emptyCheck(data)){
                    if(x.indexOf(data.uid) != -1){
                        socket.broadcast.in(room).emit("typing",user.name+" is typing....",room);
                    }
                }
                });
            }
        });
    });
    socket.on('dtrequest',function(room){
        ChatRooModule.find({_id:room},function(err,data){
            if(data!=emptyCheck(data)){
                var x=data[0].users;
                Connected.findOne({socket_id:socket.id},function(err,user){
                    if(user !=emptyCheck(user)){
                    if(x.indexOf(user.uid) != -1){
                        x.pull(user.uid);
                        Draw.find({users:{$in:x}},function(err,data){
                            if(data!=emptyCheck(data)){
                                socket.emit('already drawing');                                
                            }else{
                                Connected.find({uid:{$in:x}},function(err,data){
                                    if(data!=emptyCheck(data)){
                                        DrawRequest.updateOne({room_id:room},{$set:{sender:user.uid}},{upsert:true},function(err,data){

                                        });
                                        User.findOne({_id:user.uid},{name:1,imgid:1},function(err,data){
                                            io.sockets.in(room).emit('dtrequest',data,room);
                                        });
                                    }else{
                                        Draw.deleteOne({room_id:room},function(err){
                                        });
                                        socket.emit('no dt user active');
                                    }
                                });

                            }

                        });
                    }
                }
                });

            }
        });

    });

    socket.on('cancel dt request',function(uid,room){
        ChatRooModule.find({_id:room},function(err,data){
            if(data!=emptyCheck(data)){
                 var x=data[0].users;
                 Connected.findOne({socket_id:socket.id},function(err,data){
                     if(data !=emptyCheck(data)){
                     if(x.indexOf(data.uid) != -1){
                         DrawRequest.findOne({room_id:room},function(err,data){
                             if(data!=emptyCheck(data)){
                             if(data.sender!=uid){
                                DrawRequest.deleteOne({room_id:room},function(err){
                                    io.sockets.in(room).emit('dt request cancelled',uid);
                                });
                            }
                        }

                         });
                     }
                 }
                 });
             }
         });
        
    });
    socket.on('dt request accept',function(room){
        ChatRooModule.find({_id:room},function(err,data){
            if(data!=emptyCheck(data)){
                 var x=data[0].users;
                 Connected.findOne({socket_id:socket.id},function(err,user){
                     if(user !=emptyCheck(user)){
                     if(x.indexOf(user.uid) != -1){
                         DrawRequest.findOne({room_id:room},function(err,data){
                             var sender=data.sender;
                             Draw.updateOne({room_id:room,users:{$ne:sender}},{$push:{users:sender}},{upsert:true},function(err,data){
                                
                             });

                         });
                         Draw.updateOne({room_id:room},{$push:{users:user.uid}},{upsert:true},function(err,data){
                             
                         });
                         User.findOne({_id:user.uid},{name:1,imgid:1},function(err,data){
                            io.sockets.in(room).emit("dtJoined",room,data);
                         });
                     }
                 }
                 });
             }
         });

    });
   
    socket.on('canvas check',function(room){
        ChatRooModule.find({_id:room},function(err,data){
            if(data!=emptyCheck(data)){
                 var x=data[0].users;
                 Connected.findOne({socket_id:socket.id},function(err,user){
                     if(user !=emptyCheck(user)){
                     if(x.indexOf(user.uid) != -1){
                         Draw.findOne({room_id:room,users:user.uid},function(err,data){
                             if(data!=emptyCheck(data)){
                                 socket.emit('canvas active');
                            }

                         });
                     }
                 }
                 });
             }
         });

    });
    socket.on('close portal',function(room){
                 Connected.findOne({socket_id:socket.id},function(err,user){
                     if(user !=emptyCheck(user)){
                        Draw.findOneAndUpdate({room_id:room,users:user.uid},{$pull:{users:user.uid}},{new:true},function(err,data){
                            if(data!=emptyCheck(data)){
                                if(data.users.length<1){
                                    DrawRequest.deleteOne({room_id:room},function(err){
                                    });
                                    Draw.deleteOne({room_id:room},function(err){
                                    });
                                }
                                Connected.find({uid:{$in:data.users}},function(err,data){
                                    data.forEach(element => {
                                     io.to(element.socket_id).emit('dt user left',user.uid);
                                    });
                                 });
                                 socket.emit('dt user left',user.uid);
                            }
                         });                   
                     
                 }
                 });

    });

    
    socket.on('startPosition',function(cx,cy,room,uid,property){
        Draw.findOne({room_id:room,users:uid},function(err,data){
            if(data!=emptyCheck(data)){
           socket.broadcast.in(room).emit('startPosition',cx,cy,property);
        }                     
         });
    });
    socket.on('finishedPosition',function(room,uid){
        Draw.findOne({room_id:room,users:uid},function(err,data){
            if(data!=emptyCheck(data)){
                socket.broadcast.in(room).emit('finishedPosition');
        }                     
         });
    });

    
    socket.on('canvas draw',function(cx,cy,room,uid,property){
        Draw.findOne({room_id:room,users:uid},function(err,data){
            if(data!=emptyCheck(data)){
                socket.broadcast.in(room).emit('canvas draw',cx,cy,property);
        }                     
         });
    });

    socket.on('canvas clear',function(room,uid){
        Draw.findOne({room_id:room,users:uid},function(err,data){
            if(data!=emptyCheck(data)){
                io.sockets.in(room).emit('canvas clear');
        }                     
         });
    });

    socket.on('canvas scroll',function(scroll,height,room,uid){
        Draw.findOne({room_id:room,users:uid},function(err,data){
            if(data!=emptyCheck(data)){
              socket.broadcast.in(room).emit('canvas scroll',scroll,height);
        }                     
         });
    });
    socket.on('takeCharge',function(room,uid){
        Draw.findOne({room_id:room,users:uid},function(err,data){
            if(data!=emptyCheck(data)){
                socket.broadcast.in(room).emit('chargeTaken');
            };
        });
    });
    socket.on('passCharge',function(room,uid){
        Draw.findOne({room_id:room,users:uid},function(err,data){
            if(data!=emptyCheck(data)){
                socket.broadcast.in(room).emit('chargePassed');
            };
        });
    });
    


    socket.on('disconnect', function () {
        Connected.findOne({socket_id:socket.id},function(err,user){
           if(user!=emptyCheck(user)){
            User.updateOne({_id:user.uid},{$set:{status:'offline'}},{new:true},function(err,data){
           
            });
            Draw.findOneAndUpdate({users:user.uid},{$pull:{users:user.uid}},{new:true},function(err,data){
                if(data!=emptyCheck(data)){
                    if(data.users.length<1){
                        DrawRequest.deleteOne({room_id:data.room_id},function(err){
                        });
                        Draw.deleteOne({room_id:data.room_id},function(err){
                        });
                    }
                    Connected.find({uid:{$in:data.users}},function(err,data){
                        data.forEach(element => {
                         io.to(element.socket_id).emit('dt user left',user.uid);
                        });
                     });
                }
             });              
        
            ChatRooModule.find({users:{$all:[user.uid]}},function(err,data){
                data.forEach(element=>{
                   socket.broadcast.in(element.id).emit('disconnected',user.uid);
                });
            });
            Connected.deleteOne({socket_id:socket.id},function(err,data){
                
            });
        }

        });
  
    });

 }); 