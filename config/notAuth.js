module.exports=function(req,res,next){
    if(!req.user){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    }else{
        res.redirect('/chat');
    }
}