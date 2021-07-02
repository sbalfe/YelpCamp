const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({

      email: {
            type: String,
            required: true, 
            unique: true
      }

})

/* plugin certain functions to apply to certain schemas */

/* This one adds a username and password with the correct auth used alongisde various validation */

/* extends the number of methods available for use. */
UserSchema.plugin(passportLocalMongoose); /* adds the password with hash and salt applied to the username and password */


module.exports = mongoose.model('User', UserSchema);