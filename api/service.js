const request = require('request');

var Posts = {
    Authenticate: (req, res) => {
        // If Authunticate is not present or null
            // Generate a random number
            // Send SMS using Twilio
            // Respond with 401
      if (req.body.hasOwnProperty('Authenticate') &&
          req.body.Authenticate != null &&
          req.body.Authenticate != '') {
        // If Authunticate is  present
        // Check session db to find auth_token
        // MAtch with the incoming auth_token
        // If not matched; respond with 401
        // else respond with 200 + Session ID
        const profileDb = require ('./database');
        profileDb.GetSession(req.body.Author, req.body.Authenticate,
                                              function(retval, info) {
                                                       res.send( { "Response": retval,  "Session-Info": info} );
                                              }
                            );

      } else {
          const max = 9;
          let otp6digit = Math.floor( (Math.random() * max)).toString()
                        + Math.floor( (Math.random() * max)).toString()
                        + Math.floor( (Math.random() * max)).toString()
                        + Math.floor( (Math.random() * max)).toString()
                        + Math.floor( (Math.random() * max)).toString()
                        + Math.floor( (Math.random() * max)).toString();

           const accountSid = 'ACa6a8c50f509f04a455b53dc167cdd1b9';
           const authToken = '2a788944322e447dc8a6c2a29962ceaa';
           const client = require('twilio')(accountSid, authToken);

           client.messages
                 .create({
                    body: 'OTP for Notice Board: ' + otp6digit,
                    messagingServiceSid: 'MGc55709869c143be6b4428ff6ec0c7b4d',
                    to: req.body.Author
                  })
                 .then(message => console.log(message.sid))
                 .done();

           const profileDb = require ('./database');

           console.log("AddSession: for Author " + req.body.Author + " OTP: " + otp6digit );

           profile = profileDb.AddSession(req.body.Author, otp6digit, "twillio",
                                    function(retval, info) {
                                       res.send( { Response: retval, info } );
                                 });
      }
    },

    GetUserProfile: (req, res) => {

      let authorArray = [];

      if (req.body.hasOwnProperty('Author')) {
        authorArray.push(req.body['Author']);
      } else if (req.body.hasOwnProperty('Authors')) {
          authorArray = req.body['Authors'];
      }

      let detailed = false;

      if (req.body.hasOwnProperty('ReportType')) {
        if (req.body.ReportType == "Detailed") {
          detailed = true;
        }
      }

      let permissions = [''];
      if (req.body.hasOwnProperty('Permissions')) {
          permissions = req.body.Permissions;
      } else {
        permissions[0] = "Add";
      }

      console.log("Total Authors: " + authorArray.length + " detailed: " + detailed + " Permissions: " + permissions);

/*
      authorArray.forEach((item, i) => {
        console.log("index:" + i + " item:" + item);
      });
*/
		// Get Post of User
		// Send it as Jason in Response
    const profileDb = require ('./database');

    profile = profileDb.GetUserProfile(authorArray, detailed, permissions,
                    function(retval, profile) {
                          res.send( { Response: retval, profile } );
                    });
    },

    AddUserProfile: (req, res) => {

      let profile = req.body;

      if (profile == null || !profile.hasOwnProperty('_id') ) {
          res.send( { Response: 400, profile })
          return;
      }

      profile.Permissions = ['View'];

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

    GetHierarchyElement: (req, res) => {

      let filter = req.body;

      // Get Hirarchy Elements by
      //  1. ID:    --> id, label, value, parentId
      //  2. Label  --> Label, [id,value,ParentId]
      //  3. ParentId --> ParentId, Label, [id,value]
      const HierarchyDb = require ('./database');

      if (filter.hasOwnProperty('_id') && (filter._id != '' || filter._id != null) ) {
          if (filter.hasOwnProperty('type')) {
            if (filter.type === 'Child') {
                HierarchyDb.GetHierarchyElementChildren(filter._id,
                            function(retval, hierarchyElements) {
                                  console.log(JSON.stringify(hierarchyElements));
                                  res.send( { Response: retval, hierarchyElements } );
                            });
            } else if (filter.type === 'Parent') {
                HierarchyDb.GetHierarchyElementParent(filter._id,
                            function(retval, hierarchyElements) {
                                  console.log(JSON.stringify(hierarchyElements));
                                  res.send( { Response: retval, hierarchyElements } );
                            });
            } else if (filter.type === 'None'){
                HierarchyDb.GetHierarchyElementById(filter._id,
                        function(retval, hierarchyElements) {
                              console.log(JSON.stringify(hierarchyElements));
                              res.send( { Response: retval, hierarchyElements } );
                        });
            }
          } else {
            res.send( { Response: 400, Reason: "id or type null - Don't know what to Get" } );
          }
      } else if (filter.hasOwnProperty('label')) {
          HierarchyDb.GetHierarchyElementByLabel(filter.label,
                        function(retval, hierarchyElements) {
                              console.log(JSON.stringify(hierarchyElements));
                              res.send( { Response: retval, hierarchyElements } );
                        });
      } else {
          res.send( { Response: 400, Reason: "Keys Null - Don't know what to Get" } );
      }
    },

    AddHierarchyElement: (req, res) => {

      if (  !req.body.hasOwnProperty('label') ||
            !req.body.hasOwnProperty('value')
          ) {
              res.send( { Response: 400, Reason: "Bad Values received" + req.body } );
      } else {
          label = req.body.label;
          value = req.body.value;
          parentId = req.body.hasOwnProperty('parentId') ? req.body.parentId : '';

          // {label, value, parentId} --> Mandatory fields

          const HierarchyDb = require ('./database');

          HierarchyDb.AddHierarchyElement(label, value, parentId,
                        function(retval, e) {
                              res.send( { Response: retval, e } );
                        });
      } // end else
    },

    DeleteHierarchyElement: (req, res) => {

        // Delete Hirarchy Elements by
        //  1. ID:    --> Remove Single Entry
        //  2. Label  --> Delete Multipe Ids and update Parents of Child to Own Parent
        const HierarchyDb = require ('./database');

        if (req.body.hasOwnProperty('_id')) {
            HierarchyDb.DeleteHierarchyElementById(req.body._id,
                          function(retval, profile) {
                                res.send( { Response: retval, profile } );
                          });
        } else if (req.body.hasOwnProperty('value')) {
            HierarchyDb.DeleteHierarchyElementByValue(req.body.value,
                          function(retval, profile) {
                                res.send( { Response: retval, profile } );
                          });
        } else {
            res.send( { Response: 400, Reason: "Keys Null - Don't know what to delete" + req.body } );
        }
    },


    AddFeedback: (req, res) => {

      let feedback = req.body;

      // Get Post of User
      // Send it as Jason in Response
      const postDb = require ('./database');

      postDb.AddFeedback(feedback,
                    function(retval, p) {
                          console.log(p);
                          res.send( { Response: retval, p } );
                    });
    },

    GetRandomImage: async (req, res) => {

      let feedback = req.body;

      // Get Post of User
      // Send it as Jason in Response
      const imagedir = './app/images';

      const fs = require('fs');
/*
      const getNumFiles = (dir) => new Promise ( async (resolve) => {
        fs.readdir(dir).then((files) => {
            console.log(files.length);
          });

          console.log(files.length);


          let cnt = await fs.readdir(dir, (err, files) => {
            count = files.length;
            resolve(files.count);
            console.log("getNumFiles: " + files.length);
          });

          resolve (cnt);
      });



      let c = await getNumFiles(imagedir);

      console.log("main: " + c);

      //count -= 2; // skip . & ..
*/
     let count = 13;

      let number = Math.floor( (Math.random() * count) + 1); //between(1,count);
      number = 1; // hardcoding for testing
      //console.log("Got Number: " + number);

      var fileName = 'u'+ number + ".jpg";
      var options = {
            root: imagedir
        };

        res.sendFile(fileName, options, function (err) {
            if (err) {
                console.error(err);
            } else {
                //console.log('Sent:', fileName);
            }
        });
    },
};

module.exports = Posts;
