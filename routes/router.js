var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fs = require("fs");
var User = require('../models/user');
var Post = require('../models/post');

// Authenticate user
router.post('/user/auth', function(req, res, next){
  User.authenticate(req.body.email, req.body.password, function (error, user) {
    if (error || !user) {
      var err = new Error('Wrong email or password.');
      err.status = 401;
      return next(err);
    } else {
      req.session.userId = user._id;
      console.log(req.session);
      return res.redirect('/user/'+user._id);
    }
  });
})

// Store new user
router.post('/user', function(req, res, next){
  var userData = {
    name: {
      first: "Steve",
      last: "de Vette",
    },
    login: {
      username: "sdevette",
      password: "test",
    },
    picture: {
      large: "https://randomuser.me/api/portraits/men/17.jpg",
      medium: "https://randomuser.me/api/portraits/med/men/17.jpg",
      thumbnail: "https://randomuser.me/api/portraits/thumb/men/17.jpg"
    },
    email: "smhhdevette@gmail.com",
    cell: "0614415274",
    phone: "0614415274",
    gender: "male",
    nat: "NL",
    location: {
      city: "Den Bosch",
      postcode: 5212,
      street: "Werfpad 3b",
      state: "Noord-Brabant",
      coordinates: {
        latitude: 0.0000,
        longitude: 0.0000,
      }
    },
    registered: {
      date: Date.now()
    }
  }

  let path = __dirname + "/public/pictures/";

  let filename = req.body.user.name.first + "-" + req.body.user.name.last + ".png";

  path = path.replace("/routes", "");
  filename = filename.replace(" ", "-");
  cdnpath = "http://localhost:3000/static/pictures/";

  console.log(path);

  let base64Data = req.body.user.pictureBase.replace(/^data:([A-Za-z-+/]+);base64,/, '');
  fs.writeFile(path+filename, base64Data, 'base64', (err) => {
    console.log(err);
  });

  req.body.user.picture.thumbnail = cdnpath + filename;
  req.body.user.picture.medium = cdnpath + filename;
  req.body.user.picture.large = cdnpath + filename;

  User.create(req.body.user, function (error, user) {
    if (error) {
      return next(error);
    } else {
      req.session.userId = user._id;
    }
  });
});

// Get user info + posts made by user
router.get('/user/:userId?', function(req, res, next){
  let userId;
  req.params.userId ? userId = mongoose.Types.ObjectId(req.params.userId) : userId = mongoose.Types.ObjectId(req.session.userId)
  User.aggregate([
    { $match: { _id: userId } },
    { 
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts"
      }
    },
    { $limit : 1 }
  ])
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user.length === 0) {
        var err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      } else {
        return res.send(JSON.stringify(user[0]));
      }
    }
  });
});

// Middleware for login check
function requiresLogin(req,res,next){
  if(req.session && req.session.userId){
    return next();
  }  else {
    var err = new Error('You must be logged in to access this function');
    err.status = 401;
    return next(err);
  }
}

// Make a new post
router.post('/post', requiresLogin, function(req, res, next){
  console.log(req.session.userId);
  Post.create({
    body: req.body.body,
    userId: mongoose.Types.ObjectId(req.session.userId)
  }, function (error, user) {
    if (error) {
      return next(error);
    } else {
      return res.redirect('/user/'+req.session.userId);
    }
  })
  
});

// Retrieve a post
router.get('/post/:postId', function(req, res, next){

});

// Retrieve a list of relevant posts
router.get('/feed', requiresLogin, function(req, res, next){

});

// Digg a post
router.post('/post/:postId/digg', requiresLogin, function(req, res, next){
  console.log(req.session.userId);
  Post.updateOne({
    _id: mongoose.Types.ObjectId(req.params.postId)
  },{
    $inc: { diggs: 1},
    $addToSet: { digglist: [mongoose.Types.ObjectId(req.session.userId)]}
  }, function(error, affected, resp) {
    console.log(resp);
    if (error) {
      return next(error);
    } else {
      return res.redirect('/user/'+req.session.userId);
    }
  })
});

// Reply to a post
router.post('/post/:postId/reply', requiresLogin, function(req, res, next){
  Post.updateOne({
    _id: mongoose.Types.ObjectId(req.params.postId)
  },{
    $push: { reply: {
      userId: mongoose.Types.ObjectId(req.session.userId),
      body: req.body.body,
      user: {
        name: {
          first: "Test",
          last: "detest"
        },
        picture: {
          thumbnail: "https://randomuser.me/api/portraits/thumb/men/17.jpg"
        }
      }
    }}
  }, function(error, affected, resp) {
    console.log(resp);
    if (error) {
      return next(error);
    } else {
      return res.redirect('/user/'+req.session.userId);
    }
  })
});

// Digg a reply to a post
router.post('/post/:postId/reply/:replyId/digg', requiresLogin, function(req, res, next){

});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;