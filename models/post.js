var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

let UserSchema = new mongoose.Schema({
  name: NameSchema,
  picture: PictureSchema
})

let ReplySchema = new mongoose.Schema({
  body: {
    type: String,
  },
  diggs: {
    type: Number
  },
  digglist: [Number],
  user: UserSchema,
  postedDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

let PostSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true
  },
  diggs: {
    type: Number,
    default: 0,
  },
  reply: [ReplySchema],
  postedDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  digglist: [Schema.Types.ObjectId]
})

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;