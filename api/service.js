const request = require('request');

var Posts = {
    GetUserProfile: (req, res) => {

      let user = req.body.Author;

      if (user == null) {
          res.send( { Response: 400 })
          return;
      }
		// Get Post of User
		// Send it as Jason in Response
    const profileDb = require ('./database');

    profile = profileDb.GetUserProfile(user,
                    function(retval, profile) {
                          console.log(profile);
                          res.send( { Response: retval, profile } );
                    });
    },

    AddUserProfile: (req, res) => {

      let profile = req.body;

      if (profile == null || !profile.hasOwnProperty('_id') ) {
          res.send( { Response: 400, profile })
          return;
      }
    // Get Post of User
    // Send it as Jason in Response
    const profileDb = require ('./database');

    profile = profileDb.AddUserProfile(profile,
                    function(retval, p) {
                          console.log(p);
                          res.send( { Response: retval, p } );
                    });
    },

    UpdateUserProfile: (req, res) => {

      let profile = req.body;

      if (profile == null || !profile.hasOwnProperty('_id') ) {
          res.send( { Response: 400, profile })
          return;
      }
    // Get Post of User
    // Send it as Jason in Response
    const profileDb = require ('./database');

    profile = profileDb.UpdateUserProfile(profile,
                    function(retval, p) {
                          console.log(p);
                          res.send( { Response: retval, p } );
                    });
    },

    DeleteUserProfile: (req, res) => {

      let profile = req.body;

      if (profile == null || !profile.hasOwnProperty('_id') ) {
          res.send( { Response: 400, profile })
          return;
      }
    // Get Post of User
    // Send it as Jason in Response
    const profileDb = require ('./database');

    profile = profileDb.DeleteUserProfile(profile,
                    function(retval, p) {
                          console.log(p);
                          res.send( { Response: retval, p } );
                    });
    },

    AddUserPost: (req, res) => {

      let post = req.body;

      // Get Post of User
      // Send it as Jason in Response
      const postDb = require ('./database');

      postDb.AddUserPost(post,
                    function(retval, p) {
                          console.log(p);
                          res.send( { Response: retval, p } );
                    });
    },

    GetUserPost: (req, res) => {

      let post = req.body;

      // Get Post of User
      // Send it as Jason in Response
      const postDb = require ('./database');

      postDb.GetUserPost(post,
                    function(retval, p) {
                          console.log(p);
                          res.send( { Response: retval, p } );
                    });
    },

    DeleteUserPost: (req, res) => {

      let post = req.body;

      // Get Post of User
      // Send it as Jason in Response
      const postDb = require ('./database');

      postDb.DeleteUserPost(post,
                    function(retval, p) {
                          console.log(p);
                          res.send( { Response: retval, p } );
                    });
    },

};

module.exports = Posts;
