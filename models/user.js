var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var LoginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  }
})

var NameSchema = new mongoose.Schema({
  first: {
    type: String,
    required: true,
    trim: true
  },
  last: {
    type: String,
    required: true,
    trim: true
  }
});

var PictureSchema = new mongoose.Schema({
  thumbnail: {
    type: String,
    trim: true,
  },
  medium: {
    type: String,
    trim: true,
  },
  large: {
    type: String,
    trim: true,
  }
});

var CoordinatesSchema = new mongoose.Schema({
  latitude: Schema.Types.Decimal128,
  longitude: Schema.Types.Decimal128
});

var LocationSchema = new mongoose.Schema({
  city: String,
  postcode: String,
  street: String,
  state: String,
  coordinates: CoordinatesSchema
})

var RegisteredSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true,
  }
})

var UserSchema = new mongoose.Schema({
  login: LoginSchema,
  name: NameSchema,
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  cell: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    trim: true
  },
  picture: PictureSchema,
  nat: {
    type: String,
    required: true,
    trim: true,
  },
  location: LocationSchema,
  friendlist: [Schema.Types.ObjectId],
  registered: RegisteredSchema
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.login.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.login.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.login.password = hash;
    next();
  })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;

