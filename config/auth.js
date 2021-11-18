module.exports = {
    ensureAuthenticated : function(req,res,next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg' , 'please login to view this resource');
        res.redirect('/users/login');
    },
    ensure2FA : function(req,res,next) {
        if(req.isAuthenticated() ) {  // Add 2FA check
            return next();
        }
        req.flash('error_msg' , 'please login to view this resource');
        res.redirect('/users/login-otp');
    }
}