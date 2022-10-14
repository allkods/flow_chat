var socket=io.connect();

    var currentName='';
    var currentLogo='';
    var clientRoom='';
    var scTop=0;
    var chatContentScroll=true;

    //room tile click function.........

function tile_click(data){
        $('#chat').css('transform','translateX(0)');
        $('#chatContent').html('');
        clientRoom=data.value;
        currentName=data.getElementsByTagName("b")[0].innerHTML;
        currentLogo=data.parentNode.getElementsByClassName("room-logo")[0].style.backgroundImage;
        document.getElementById('chatPnlLogo').style.backgroundImage=currentLogo;
        document.getElementById('chatPnlLogo').style.backgroundSize="cover";
        data.parentNode.getElementsByClassName('noOfMsg')[0].style.transform="scale(0)";
        data.parentNode.getElementsByClassName('noOfMsg')[0].value=0;
        $("#details>h4").html(currentName);
        $('#controllers').css('display','block');
        $('#chat>header').css('display','block');
        $('#chatContent').css('overflowY','scroll');
        //Socket connection on selecting particular room tile
        $('#draw').css('display','none');
          socket.emit('new user',clientRoom,user.id);
          socket.emit('canvas check',clientRoom);
          
}

//Click on search result function........

function search_result_click(item){
    $.ajax({
        type: 'POST',
        url: '/chat/createRoom',
        data:{user1:user.id,user2:item.value},
        success: function(data){
            if(data.action=='success'){
                $('#new-chat-panel').css('transform','translateX(-100%)');
                $('#'+data.data).click();
            }
            else if(data.action=='create'){
                $('#new-chat-panel').css('transform','translateX(-100%)'); 
                $('#chat').css('transform','translateX(0)');
                $('#chatContent').html('');
                clientId=item.value;
                currentLogo=item.getElementsByClassName('room-logo')[0].style.backgroundImage;
                currentName=item.getElementsByTagName('b')[0].innerHTML;
                document.getElementById('chatPnlLogo').style.backgroundImage=currentLogo;
                document.getElementById('chatPnlLogo').style.backgroundSize="cover";
                $("#details>h4").html(currentName);
                $('#controllers').css('display','block');
                $('#chat>header').css('display','block');
                $('#chatContent').css('overflowY','scroll');
                clientRoom=item.value;
            }
        }
      }); 

   }

//Menu Trigger function...........

   var menucounter=0;
   function menuToggle(){
    if(menucounter==0){
        $('#menuContainer').css('transition','none');
        $('#menuContainer').css('visibility','visible');
        $('#menu').css('transform','translateX(0');
        menucounter++;
      }else{
        $('#menuContainer').css('transition','visibility 500ms ease');
        $('#menu').css('transform','translateX(100%');
        $('#menuContainer').css('visibility','hidden');
        menucounter=0;
      }
   }

//Resolving Date to simpler form........

   function getDate(data){
    var date=new Date(data);
    date=date.getFullYear()+'/'+date.getMonth()+1+'/'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    return date;
}

function newChatBtn(){
    document.getElementById('new-chat-panel').style.transform="translateX(0)";
}

// Draw together Request accept function.........
 function dtrequestAccept(data){
    var room=data.value;
    var rm=document.querySelector('#dtrequestAccept');
    if(rm!=null)
    rm.parentNode.removeChild(rm);
    socket.emit('dt request accept',room);
 }
function dtRequestDelete(data){
    socket.emit('cancel dt request',user.id,data.value);
    var c=data.parentNode.parentNode;
    c.parentNode.removeChild(c);
}



 // Declarations for Canvas........

 const canvas=document.getElementById('canvas');
 const ctx=canvas.getContext('2d');
 const ctx2=canvas.getContext('2d');
 var linecolor=$('#colorContainer>div>input:checked').val();
 var linewidth=$('#strokeSize').val();
 var linecap="round";
 var canvasX=0;
 var canvasY=0;
 let painting=false;
 let painting2=false;
 let Charge=false;





 function startPosition(e){
     if(!Charge) return;
    if(e.button==0)
    painting=true;
    draw(e);
    cx=(e.clientX)-(canvas.getBoundingClientRect().left);
    cy=(e.clientY)-(canvas.getBoundingClientRect().top);
    ctx.moveTo(cx,cy);
    socket.emit('startPosition',cx,cy,clientRoom,user.id,{color:linecolor,width:linewidth});
  }
  function touchStart(e){
    if(!Charge) return;
    painting=true;
    drawMob(e);
    cx=(e.touches[0].clientX)-(canvas.getBoundingClientRect().left);
    cy=(e.touches[0].clientY)-(canvas.getBoundingClientRect().top);
    ctx.moveTo(cx,cy);
    socket.emit('startPosition',cx,cy,clientRoom,user.id,{color:linecolor,width:linewidth});
  }
  function finishedPosition(){
    if(!Charge) return;
    painting=false;
    ctx.beginPath();
    socket.emit('finishedPosition',clientRoom,user.id);
  }
  function touchEnd(){
    if(!Charge) return;
    painting=false;
    ctx.beginPath();
    socket.emit('finishedPosition',clientRoom,user.id);
  }

  function draw(e){
    if(!Charge) return;
    if(!painting) return;
    ctx.lineWidth=linewidth;
    ctx.lineCap=linecap;
    cx=(e.clientX)-(canvas.getBoundingClientRect().left);
    cy=(e.clientY)-(canvas.getBoundingClientRect().top);
    ctx.lineTo(cx,cy);
    ctx.strokeStyle=linecolor;
    ctx.stroke();
    ctx.beginPath();
    ctx.lineTo(cx,cy);
    socket.emit('canvas draw',cx,cy,clientRoom,user.id,{color:linecolor,width:linewidth});
  }
  function drawMob(e){
    e.preventDefault();
    if(!Charge) return;
    ctx.lineWidth=linewidth;
    ctx.lineCap=linecap;
    cx=(e.touches[0].clientX)-(canvas.getBoundingClientRect().left);
    cy=(e.touches[0].clientY)-(canvas.getBoundingClientRect().top);
    ctx.lineTo(cx,cy);
    ctx.strokeStyle=linecolor;
    ctx.stroke();
    ctx.beginPath();
    ctx.lineTo(cx,cy);
    socket.emit('canvas draw',cx,cy,clientRoom,user.id,{color:linecolor,width:linewidth});
  }

  socket.on('startPosition',function(cx,cy,property){
    painting2=true;
    ctx2.lineWidth=property.width;
    ctx2.lineCap=linecap;
    ctx2.moveTo(cx,cy);
    ctx2.lineTo(cx,cy);
    ctx2.strokeStyle=property.color;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.lineTo(cx,cy);

  });
  socket.on('finishedPosition',function(){
    painting2=false;
    ctx2.beginPath();
  });
  socket.on('canvas draw',function(cx,cy,property){
    if(!painting2) return;
    ctx2.lineWidth=property.width;
    ctx2.lineCap=linecap;
    ctx2.lineTo(cx,cy);
    ctx2.strokeStyle=property.color;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.lineTo(cx,cy);
  });



$('#draw').on('scroll',function(){
    if(!Charge)return;
    var x=$('#draw').scrollTop();
    var h=$('#draw').height();
    socket.emit('canvas scroll',x,h,clientRoom,user.id);
})
socket.on('canvas scroll',function(scroll,height){
    if(Charge)return;
    var h=$('#draw').height();
    if(scroll>height-h){
        $('#draw').scrollTop(scroll+(height-h))
    }else{
        $('#draw').scrollTop(scroll);
    }
});


  canvas.addEventListener('mousedown',startPosition);
  canvas.addEventListener('mouseup',finishedPosition);
  canvas.addEventListener('mousemove',draw);
  canvas.addEventListener('touchstart',touchStart);
  canvas.addEventListener('touchend',touchEnd);
  canvas.addEventListener('touchmove',drawMob);

 //......................................//
 //Document on ready trigger.....
$(function(){    

    //Responsive....//
       window.addEventListener('resize',function(){
          
       });
      
        //Setting no. of msg to display for Room//
        var log=document.getElementsByClassName('noOfMsg');
        for(var i=0;i<log.length;i++){
            if(log[i].value>0){
            log[i].style.transform="scale(1)";
            }
        }

  //Back button functionality//
   $('#back').on({
       click:function(){
        $('#chat').css('transform','translateX(100%)');
        clientRoom='';
        $('#controllers').css('display','none');
        $('#chat>header').css('display','none');
        $('#chatContent').html('');
       }
   })

//Socket connection on online
socket.emit('online',user);
socket.on("online",function(user){
    document.getElementById('active').innerHTML +='<button class="active" value="'+user.id+'" id="'+user.id+'" onclick="search_result_click(this)"><div class="activeLogo" style="background-image: url(/images/dp/'+user.imgid+');background-size: cover;"></div><h4>'+user.name+'</h4></button>';
});

//Getting information of selected room//
chatcnt=document.getElementById('chatContent');

socket.on("chat history",function(data,uid){
    if(user.id==uid){
    chatcnt.innerHTML='';
    data[0].records.forEach(element => {
        if(element.uid==user.id){
            chatcnt.innerHTML +="<div class='outgoing'><div class='room-logo' style='background-image:url("+currentMyLogo+");background-size:cover;'></div><p>"+element.message+"</p></div>";
        }else{
            chatcnt.innerHTML +="<div class='incoming'><div class='room-logo' style='background-image:"+currentLogo+";background-size:cover'></div><p>"+element.message+"</p></div>";        
    }
    });
      var sch=document.getElementById('chatContent').scrollHeight;
      $('#chatContent').scrollTop(sch);
      scTop=document.getElementById('chatContent').scrollTop;
      socket.emit('read',clientRoom);
    }
});

//Sending Realtime messages....//
$('#msgForm').on({
    submit:function(e){
        e.preventDefault();
        val=$('#msg').val();
        $('#msg').val('');
        if(val!=''){
        chatcnt.innerHTML +="<div class='outgoing'><div class='room-logo' style='background-image:url(/images/dp/"+user.imgid+");background-size:cover;'></div><p>"+val+"</p></div>";
        var h=document.getElementById('chatContent').scrollHeight;
        $('#chatContent').scrollTop(h);
        socket.emit('new message',val,clientRoom);
        }
    }
})



//Fetching Realtime Messages//
socket.on("new message",function(msg,uid,room,created){
    if(created===true){
        if(uid==user.id){
            clientRoom=room;
        }
    }
    if(room==clientRoom){
        clearTimeout(hidetVar);
        $('#typing-popup').html('');
        var h1=document.getElementById('chatContent').scrollHeight;
    if(user.id!=uid){
        document.getElementById('popUpTone').play();
        chatcnt.innerHTML +="<div class='incoming'><div class='room-logo' style='background-image:"+currentLogo+";background-size:cover;'></div><p>"+msg.msg+"</p></div>";
    }
    if(chatContentScroll){
        var h=document.getElementById('chatContent').scrollHeight;
        $('#chatContent').scrollTop(h);
        scTop=document.getElementById('chatContent').scrollTop;
    }
    socket.emit('read',clientRoom);
}else{
    document.getElementById(room).parentNode.getElementsByClassName('noOfMsg')[0].value++;
    document.getElementById(room).parentNode.getElementsByClassName('noOfMsg')[0].style.transform="scale(1)";
}
var clone=document.getElementById(room).parentNode.cloneNode(true);
var remove=document.getElementById(room).parentNode;
var dd=document.getElementById('after-room');
remove.parentNode.removeChild(remove);
dd.innerHTML=clone.outerHTML+dd.innerHTML;
//remove.parentNode.removeChild(remove);
document.getElementById(room).getElementsByTagName('h4')[0].innerHTML=msg.msg;
document.getElementById(room).getElementsByTagName('i')[0].innerHTML=msg.date;
});

//
$('#chatContent').on('scroll',function(e){
   var x=document.getElementById('chatContent').scrollTop;
   if(x<scTop)
   chatContentScroll=false;
   else
   chatContentScroll=true;
});

socket.on('new room created',function(sender,receiver,room,msg){
    if(document.getElementById(room)===null){
        if(user.id==sender._id){
            var src;
            if(receiver.imgid!='')
            src="/images/dp/"+receiver.imgid;
            else{
                if(receiver.gender=='male')
                src="/images/dp/default_male.jpg";
                else
                src="/images/dp/default_female.jpg";
            }
            var add=document.getElementById('after-room');
            add.innerHTML='<div class="room-tile"><div class="room-logo" style="background-image:url('+src+');background-size:cover;"></div><button class="room-detail" value="'+room+'" id="'+room+'" onclick="tile_click(this)"><b>'+receiver.name+'</b><i>'+msg.date+'</i><h4>'+msg.msg+'</h4></button><input type="button" class="noOfMsg" value="0"></div>'+add.innerHTML;
        }else{
            var src;
            if(sender.imgid!='')
            src="/images/dp/"+sender.imgid;
            else{
                if(sender.gender=='male')
                src="/images/dp/default_male.jpg";
                else
                src="/images/dp/default_female.jpg";
            }
            var add=document.getElementById('after-room');
            add.innerHTML='<div class="room-tile"><div class="room-logo" style="background-image:url('+src+');background-size:cover;"></div><button class="room-detail" value="'+room+'" id="'+room+'" onclick="tile_click(this)"><b>'+sender.name+'</b><i>'+msg.date+'</i><h4>'+msg.msg+'</h4></button><input type="button" class="noOfMsg" value="1"></div>'+add.innerHTML;
            document.getElementById(room).parentNode.getElementsByClassName('noOfMsg')[0].style.transform="scale(1)";
        
        }
        $('#after-room>svg,#after-room>h4').css('display','none');
    }else{
        if(user.id==sender._id){
            $('#'+room).click();
        }
    }

});

//Sending Realtime Typing message//
$('#msg').on('keyup',function(e){
    if(e.keyCode != 8 && e.keyCode != 13){socket.emit("typing",user,clientRoom);}

});

//Fetching Realtime typing message...//
function hidet(){
    $('#typing-popup').html('');
}
var hidetVar;
socket.on("typing",function(data,room){
    if(room==clientRoom){
        $('#typing-popup').css('display','block');
        document.getElementById('typing-popup').innerHTML=data;
        clearTimeout(hidetVar);
        hidetVar=setTimeout(hidet,2000);
    }
});
socket.on('disconnected',function(data){
    var active=document.getElementById(data);
        active.parentNode.removeChild(active);  
});

//Home Menu Switch Functionality //
var menuSwitcher1=$('#menu-switcher>li:nth-child(1)');
var menuSwitcher2=$('#menu-switcher>li:nth-child(2)');
menuSwitcher2.on('click',function(){
    $('#menu-switcher-slider').css('transform','translateX(100px)');
    $('#room-container').css('transform','translateX(-50%)');
    $.ajax({
        type: 'POST',
        url: '/chat/onlines',
        success: function(data){
            if(data.length>0)
            document.getElementById('active').innerHTML='';
            data.forEach(element => {
                 document.getElementById('active').innerHTML +='<button class="active" value="'+element._id+'" id="'+element._id+'" onclick="search_result_click(this)"><div class="activeLogo" style="background-image: url(/images/dp/'+element.imgid+');background-size: cover;"></div><h4>'+element.name+'</h4></button>'; 
            });
            $('.active>.activeLogo').css('animation','active 3s ease-in-out 1 forwards');           
        }
    });
});
menuSwitcher1.on('click',function(){
    $('#menu-switcher-slider').css('transform','translateX(0)');
    $('#room-container').css('transform','translateX(0)');
})

$('#new-chat-panel>header>button').on('click',function(){
    $('#new-chat-panel').css('transform','translateX(-100%)');
});
$('#new-chat-search').on('keyup',function(){
    var data=$('#new-chat-search').val();
    if(data!=''){
    $.ajax({
        type: 'POST',
        url: '/chat/search',
        data:{data:data},
        success: function(data){ 
            $('#new-chat-panel-cntnt').html('');
            if(data!=''){
               data.forEach(element => {
                   if(element._id!=user.id){
                   var xx=document.getElementById('new-chat-panel-cntnt');
                   var src;
                   if(element.imgid!=''){
                       src="/images/dp/"+element.imgid;
                   }
                  xx.innerHTML +='<button class="new-chat-panel-results" value="'+element._id+'" onclick="search_result_click(this)"><div class="room-logo" style="background-image:url('+src+');background-size:cover;"></div><div class="room-detail"><b>'+element.name+'</b><p></p><i></i></div></button>';
                    
                   }
                });
            }else{
                $('#new-chat-panel-cntnt').html('<p>No matching result found</p>');
            }
        }
      });
    }else{$('#new-chat-panel-cntnt').html('<div></div>');}
      
});
     var dttime;
     var timeout;
     function notRoomTimer(){
         var c=document.getElementById('nrTimer');
         if(c.innerHTML>0){
            c.innerHTML--;
         }else{
             clearInterval(dttime);
             var r=c.parentNode.parentNode;
             r.parentNode.removeChild(r);
         }       
     }
    function timer(){
        if(document.querySelector('#drawMsg>div>h1').innerHTML >0){
            socket.emit('dtTimer',)
            document.querySelector('#drawMsg>div>h1').innerHTML--;
        }else{
            clearInterval(dttime);
            $('#drawMsg').css('display','none');
            document.querySelector('#drawMsg>div>h1').innerHTML=10;
            var rm=document.querySelector('#dtrequestAccept');
            if(rm!=null)
            rm.parentNode.removeChild(rm);
        }
    }
    function dt_hide(){
        $('#drawMsg').css('display','none');
        $('#dtPopupContainer').html('');
        clearTimeout(timeout);
    }

    $('#dtbutton').on('click',function(){ 
        socket.emit('dtrequest',clientRoom);
    });
    socket.on('dtrequest',function(sender,room){
        clearTimeout(timeout);
        clearInterval(dttime);
        if(room==clientRoom){
        clearTimeout(timeout);
        if(user.id!=sender._id){
            document.getElementById('popUpTone').play();
            document.querySelector('#drawMsg>div>h1').innerHTML=10;
            if(document.getElementById('dtrequestAccept')===null)
            document.querySelector('#drawMsg>div').innerHTML+='<button id="dtrequestAccept" value="'+room+'" onclick="dtrequestAccept(this)">Accept</button>';
            $('#drawMsg>div>h4').html(`${name}`);
            $('#drawMsg>div>h5').html(sender.name+' has invited you to draw together');
            $('#drawMsg').css('display','block');
            $('#drawMsg_close').val(room);
            $('#drawMsg_close').css('display','block');
            dttime=setInterval(timer,1000);
        }else{
            document.querySelector('#drawMsg>div>h1').innerHTML=10;
            $('#drawMsg>div>h4').html(`Request sent`);
            $('#drawMsg>div>h5').html('waiting for your friend to join');
            $('#drawMsg').css('display','block');
            $('#drawMsg_close').css('display','none');
            dttime=setInterval(timer,1000);

        }
        }else{
            if(user.id!=sender._id){
               document.getElementById('popUpTone').play();
               document.getElementById('dtPopupContainer').innerHTML='<div class="dtPopup"><div class="room-logo" style="background:url(/images/dp/'+sender.imgid+');background-size:cover;"></div><h5>'+sender.name+' has invited you to Draw Together</h5><div id="dtPopupBtnC"><button class="Counter" id="nrTimer"></button><button id="drawMsgPopup_close" value="'+room+'" onclick="dtRequestDelete(this)">&#10006</button><button id="dtrequestAcceptPopup" value="'+room+'" onclick="dtrequestAccept(this)">&#10004</button></div></div>';
               $('#nrTimer').html(10);
               dttime=setInterval(notRoomTimer,1000);
            }

        }
    });
    socket.on('already drawing',function(){
        $('#drawMsg>div>h1').html('');
        $('#drawMsg>div>h4').html("can't send Request");
        $('#drawMsg>div>h5').html('user is already Drawing');
        $('#drawMsg').css('display','block');
        timeout=setTimeout(dt_hide,2000);
    });
    socket.on('no dt user active',function(){
        $('#drawMsg>div>h1').html('');
        $('#drawMsg>div>h4').html("can't send Request");
        $('#drawMsg>div>h5').html('user is offline');
        $('#drawMsg').css('display','block');
        timeout=setTimeout(dt_hide,2000);
    });
    $('#drawMsg_close').on('click',function(){
       socket.emit('cancel dt request',user.id,this.value);
       dt_hide();
       var rm=document.querySelector('#dtrequestAccept');
       if(rm!=null)
       rm.parentNode.removeChild(rm);
    });
    socket.on('dt request cancelled',function(uid){
        clearInterval(dttime);
            $('#drawMsg>div>h1').html('');
            $('#drawMsg>div>h4').html("Request Cancelled");
            $('#drawMsg>div>h5').html('');
            timeout=setTimeout(dt_hide,2000);
    });

    socket.on('dtJoined',function(room){
       if(room!=clientRoom){
        $('#'+room).click();
       }else{
        $('#drawMsg_close').css('display','none');
        clearInterval(dttime);
        clearTimeout(dt_hide);
       }
       dt_hide();
       $('#draw').css('display','block');
       $('#draw').scrollTop(0);
       $('#cTutorial').scrollTop(0);
       $('#canvas_close').val(room);
    });

    socket.on('canvas active',function(){
       $('#draw').css('display','block');
       $('#canvas_close').val(clientRoom);
    });

     socket.on('dt user left',function(uid){
        $('#drawMsg>div>h1').html('');
        if(uid==user.id){
            $('#drawMsg>div>h4').html("You have");
            $('#drawMsg>div>h5').html('closed the portal');
            $('#draw').css('display','none');
         }else{
            $('#drawMsg>div>h4').html("Your friend");
            $('#drawMsg>div>h5').html('has left');
         }
        $('#drawMsg').css('display','block');
        timeout=setTimeout(dt_hide,2500);

    });
    $('#canvas_close').on('click',function(){
        socket.emit('close portal',this.value);
    })
    $('#canvasClear').on('click',function(){
        if(!Charge) return;
        socket.emit('canvas clear',clientRoom,user.id);
    });
    socket.on('canvas clear',function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    var cMenuBtn=0;
    $('#WhiteDot').on('click',function(){
        if(cMenuBtn===0){
        $('#cMenuBtn').css('width','250px');
        $('#cMenuBtn').css('height','250px');
        $('#cMenuBtn').css('background','rgb(32, 31, 31)');
        $('#chargeContainer').css('display','block');
        cMenuBtn=1;
        }else{
        $('#cMenuBtn').css('width','50px');
        $('#cMenuBtn').css('height','50px');
        $('#cMenuBtn').css('background','rgba(75, 71, 71,.7)');
        $('#chargeContainer').css('display','none');
        cMenuBtn=0;
        }
    });
    $('#colorContainer>div>input').on('change',function(){
         linecolor=this.value;
    });
    $('#strokeSize').on('change',function(){
        linewidth=this.value;
    });
    $('#takeCharge').on({
        click:function(){
            socket.emit('takeCharge',clientRoom,user.id);
            Charge=true;
            this.style.display="none";
            $('#passCharge').css('display','block');
            $('#WhiteDot').css('background','indigo');
        }
    });
    $('#passCharge').on({
        click:function(){
            socket.emit('passCharge',clientRoom,user.id);
            Charge=false;
            this.style.display="none";
            $('#takeCharge').css('display','block');
            $('#WhiteDot').css('background','white');
        }
    });
    socket.on('chargeTaken',function(){
       Charge=false;
       $('#passCharge').css('display','none');
       $('#takeCharge').css('display','block');
       $('#WhiteDot').css('background','white');
    });
    socket.on('chargePassed',function(){
        Charge=true;
        $('#passCharge').css('display','block');
        $('#takeCharge').css('display','none');
        $('#WhiteDot').css('background','indigo');
     });
     $('#tutorialOK').on({
         click:function(){
             $('#cTutorial').css('display','none');
         }
     });
});



