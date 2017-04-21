var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: {type: String, required: true, index: { unique: true }},
  password: String
})

userSchema.methods.comparePassword = function(attemptedPassword, savedPassword, callback) {
  bcrypt.compare(attemptedPassword, savedPassword, function(err, isMatch) {
    if (err) {
      callback(err)
    } else {
      callback(null, isMatch);
    }
  });
}

userSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  console.log('THIS IN cipher', JSON.stringify(this));
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
})

var User = mongoose.model('User', userSchema);

module.exports = User;
