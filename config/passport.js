const LocalStrategy=require('passport-local').Strategy;
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const User=require('../modules/UserModule');

 module.exports=function(passport){
    passport.use('local-login', new LocalStrategy({usernameField:'email'},(email,password,done)=>{
        User.findOne({ email: email }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false,{message:'Email does not exist'}); }
            bcrypt.compare(password,user.password,(err,match)=>{
                if(err) throw err;
                if(match){
                    return done(null,user);
                }else{
                    return done(null,false,{message:'password incorrect'});
                }
    
            });
          });
            
    }));


      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
       
      passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
          done(err, user);
        });
      });

 }