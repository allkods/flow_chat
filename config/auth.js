module.exports=function(req,res,next){
     if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
         return next();
     }else{
         req.flash('error_msg',"Please login to continue");
         res.redirect('/');
     }
}