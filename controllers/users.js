const User= require('../models/user');

module.exports.renderRegister = (req, res) => {

    res.render('users/register');

}

module.exports.register = async (req, res, next) => {

    try{
        const {username , email, password} = req.body;
        const user = await new User({email, username});
        const reg = await User.register(user, password);
        req.login(reg, err => {
            if(err) return next(err);
            req.flash('success',`Welcome to YelpCamp ${username}`);
            res.redirect('/campgrounds')
        });
    } catch (e){
        req.flash('error', e.message);
        res.redirect('/register');

    }

}

module.exports.renderLogin = (req, res) => {

    res.render('users/login')

}

module.exports.login = (req, res) => {

    req.flash('success', 'You have logged in succesfully')
    /* login and return to where it was prompted that they logged in  */
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo /* delete the data from the session */
    res.redirect(redirectUrl);

}

module.exports.logout = (req, res) => {

    req.logout(); // logout built into passsport
    req.flash('success', 'Logged out Succesfully')
    res.redirect('/campgrounds');

}