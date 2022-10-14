var passport=require('passport');
var notAuth=require('../config/notAuth');
module.exports=function(app){

    app.get('/',notAuth,function(req,res){
          res.render('index');
    });

    app.post('/',notAuth,(req,res,next)=>{
      passport.authenticate('local-login',{
        successRedirect: '/chat',
        failureRedirect: '/',
        failureFlash: true
      })(req,res,next);
    });
    app.get('/logout',function(req,res){
       req.logout(()=>{
        req.flash('success_msg',"Yor are logged out");
        res.redirect('/chat');
       });
    });
}