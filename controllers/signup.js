var bcrypt=require('bcryptjs');
var User=require('../modules/UserModule');
var notAuth=require('../config/notAuth');
module.exports=function(router){
    router.get('/signup',notAuth,function(req,res){
          res.render('signup');
    });
    router.post('/signup',function(req,res){

        const{email,name,password,cpassword,gender}=req.body;
        var err=[];

        if(email===''||name===''||password===''||cpassword===''||typeof gender=='undefined')
        err.push({msg:'Fields cannot be empty'});

        var emailRegEx=/^[\w-\.]+@[a-z]+.[a-z]+(.[a-z]+)?$/;
        if(email.match(emailRegEx)==null)
        err.push({msg:'Email can contain only alphanumeric and .@- characters'});

        var nameRegEx=/^[a-z\s]{1,20}$/i;
        if(name.match(nameRegEx)==null)
        err.push({msg:'Name can only contain alphabets and spaces upto 20 characters'});

        var passRegEx=/^[\w@]{8,20}$/;
        if(password.match(passRegEx)==null)
        err.push({msg:'Password can only contain alphanumeric @_ without spaces'});

        if(password!=cpassword)
        err.push({msg:'password did not match'});

       if(err.length>0){
           res.render('signup',{error_msg:err,name:name,email:email});
       }else{
              User.find({email:email},function(err,data){
                  if(data!=''){
                      res.render('signup',{error_msg:[{msg:"user already exist"}],name:name,email:email});
                  }else{
                      var imgid="";
                    if(gender=='male')
                    imgid='default_male.jpg';
                    else if(gender=='female')
                    imgid='default_female.jpg';
                  bcrypt.genSalt(10, function(err, salt) {
                      bcrypt.hash(password, salt, function(err, hash) {
                         const newuser= new User({
                             email:email,
                             name:name,
                             password:hash,
                             gender:gender,
                             imgid:imgid
                         }).save(function(err,done){
                             if(err) throw err;
                            //  req.flash('success_msg','Account created, you can now login');
                            //  res.redirect('/');
                             req.login(done, function (err) {
                                res.redirect('/chat');
                            });    
                         });
                      });
                  });
                      
                      }              

                  });
      
       
            }
         
  });
  router.get('/updateDp/:id',function(req,res){
      User.findOne({_id:req.params.id},{name:1},function(err,data){
          if(data !=null){
            res.render('updateDp',{id:data.id,name:data.name});
          }else{
              res.redirect('/');
          }
      });

  });

}
