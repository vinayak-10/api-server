//'use strict';

const {MongoClient} = require('mongodb');
const ObjectID = require('mongodb').ObjectID;

var databases = {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
   GetSession: async function(author, authenticate, callback) {
     const uri = "mongodb://127.0.0.1/UserProfile";
     const client = new MongoClient(uri, { useNewUrlParser: true });

     try {
           // Connect to the MongoDB cluster
           await client.connect();

           const session = await client.db().
                                 collection("session").
                                 find( { Author: author } ).toArray();

           if (session.length) {
             callback(200, session[0]);
           }
           else {
             callback(404, {Reason: "No Session Present Or Session Expired"});
           }
         } catch (err) {
            callback(500, {Reason: "Internal Session Error"});
         } finally {
             await client.close();
             console.log("Connection to Database closed");
         }
  },

  AddSession: async function(author, token, type, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

        // Add CreationTime to it
    let dbPost = { _id: null, Author: author, auth_token: token, auth_type: type, CreatedOn: new Date() };

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db().collection("session").insertOne( dbPost );
          if (result != null) {
            // Set the expiry time in Token Response
            let t = dbPost.CreatedOn;

            t.setSeconds(t.getSeconds() + 30);

            callback(200, {ExpireBy: t});
          }
          else {
            callback(400, {Author: author});
          }
      } catch (e) {
          console.error(e);
          callback(500, {Author: author});
      } finally {
          await client.close();
      }
  },

  GetUserProfile: async function(authors, isDetailed, permissions, callback) {
//    const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&retryWrites=true&w=majority";
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    //const client2 = new MongoClient(uri, { useNewUrlParser: true });
    try {
          // Connect to the MongoDB cluster
          await client.connect();
      //    await client2.connect();
          let criteria = {};

          console.log ("Authors: " + authors.length)
          if (authors.length == 0) {
            criteria = { Permissions: { $in: permissions} };
          } else {
            criteria = { _id: { $in: authors}, Permissions: { $in: permissions} };
          }

          const profile = await client.db().
                                collection("profile").
                                find(criteria).
                                toArray();

          let numProfiles = await profile.length;
          if (profile.length) {
            // Entries received;
            // parse and prepare JSON object to be sent to
            // [
            //    { Author: <_id>, NumPosts: <Posts count>, LastUpdated: <time> }
            //    { Author: <_id>, NumPosts: <Posts count>, LastUpdated: <time> }
            // ]
            //
            let jsonA = [];
            //await profile.forEach(async (item, i) => {
            for (let i = 0; i < profile.length; i++) {

                let item = profile[i];

                //console.log("profile " + i + " item: " + JSON.stringify(item));
                // Get count of this user
                const count = await client.db()
                                .collection("posts")
                                .countDocuments({Author: item._id});

                let recent = '';

                if (count != 0) {
                  let entry = await client.db()
                                      .collection("posts")
                                      .find( {Author: item._id} )
                                      .sort( { CreatedOn: -1 } )
                                      .limit(1).toArray();

                    if (entry.length) recent = entry[0].Post;
                }

                if (isDetailed) {
                  jsonA.push({Author: item._id, name: item.name, displayName: item.displayName,
                              e_mail: item.e_mail, auth_token: item.auth_token,  auth_type: item.auth_type,
                              Permissions: item.Permissions,
                              postCount: count, recentPost: recent });
                } else {
                  jsonA.push({Author: item._id, name: item.name, Permissions: item.Permissions,
                                postCount: count, recentPost: recent });
                }
            }

            jsonA.forEach((item, i) => {
              console.log("index:" + i + " entry: " + JSON.stringify(item));
            });

            callback(200, jsonA);
          }
          else
            callback(404, {Author: authors});
      } catch (e) {
          console.error(e);
          callback(500, null);
      } finally {
          await client.close();
          console.log("Connection to Database closed");
      }
  },

  AddUserProfile: async function(profile, callback) {
//    const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&retryWrites=true&w=majority";
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db().collection("profile").insertOne( profile );
          if (result != null)
            callback(200, profile);
          else
            callback(400, profile);
      } catch (e) {
          console.error(e);
          callback(500, null);
      } finally {
          await client.close();
          //console.log("Connection to Database closed");
      }
  },

  UpdateUserProfile: async function(profile, callback) {
//    const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&retryWrites=true&w=majority";
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    try {
          let profile2update = profile;
          const filter = { _id: profile2update.Author };
          // update the value of the 'z' field to 42
          delete profile2update["Author"];

          const updateDocument = { $set: profile2update };
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db().collection("profile").updateOne(filter, updateDocument );
          if (result != null)
            callback(200, profile);
          else
            callback(400, profile);
      } catch (e) {
          console.error(e);
          callback(500, profile);
      } finally {
          await client.close();
          //console.log("Connection to Database closed");
      }
  },

  DeleteUserProfile: async function(profile, callback) {
//    const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&retryWrites=true&w=majority";
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db().collection("profile").deleteOne( { "_id" : profile.Author } );
          if (result != null)
            callback(200, profile);
          else
            callback(400, profile);
      } catch (e) {
          console.error(e);
          callback(500, null);
      } finally {
          await client.close();
          //console.log("Connection to Database closed");
      }
  },

  AddUserPost: async function(post, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    // post is of type {_id: "", Post: ""};
    // Add CreationTime to it
    let dbPost = { _id: null, Author: post.Author, Post: post.Post, CreatedOn: new Date() };

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db().collection("posts").insertOne( dbPost );
          if (result != null)
            callback(200, {CreatedOn: dbPost.CreatedOn});
          else
            callback(400, post);
      } catch (e) {
          console.error(e);
          callback(500, post);
      } finally {
          await client.close();
      }
  },

  GetUserPost: async function(post, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    // post is of type {Author: "", Post: ""};
    // Add CreationTime to it
    let criteria = {};
    let sortOrder = 0;
    if (!post.hasOwnProperty('CreatedOn')) {
      criteria = { Author: post.Author };
      sortOrder = 1;
    }
    else if (post.Direction == 'next') {
        criteria = { Author: post.Author, CreatedOn: { $gt: new Date(post.CreatedOn) } };
        sortOrder = 1;
    } else {
      criteria = { Author: post.Author, CreatedOn: { $lt: new Date(post.CreatedOn) } };
      sortOrder = -1;
    }

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const data = await client.db()
                          .collection("posts")
                          .find( criteria )
                          .sort( { CreatedOn: sortOrder } )
                          //.limit(5).toArray();
                          .toArray();
          if (data.length)
              callback(200, data);
          else callback(404, post);
      } catch (e) {
          console.error(e);
          callback(500, post);
      } finally {
          await client.close();
      }
  },

  DeleteUserPost: async function(post, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    // post is of type {_id: "", Post: ""};
    // Add CreationTime to it
    let id = 'ObjectId("' + post._id + '")';
    console.log("Delete Post Requested for " + id);

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          //const result = await client.db().collection("posts").deleteOne({ _id: new MongoClient.ObjectID(post._id) });
          const result = await client.db().collection("posts").deleteOne({ Author: post.Author, CreatedOn: new Date(post.CreatedOn) });
          if (result != null)
            callback(200, post);
          else
            callback(400, post);
      } catch (e) {
          console.error(e);
          callback(500, post);
      } finally {
          await client.close();
      }
  },

  GetHierarchyElementById: async function(id, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    let dbid = new ObjectID(id);
    let criteria = {_id: dbid};

    console.log("GetHierarchyElementById: " + JSON.stringify(criteria));
    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const data = await client.db()
                          .collection("hierarchyElements")
                          .find( criteria )
                          .toArray();
          if (data.length)
              callback(200, data);
          else callback(404, criteria);
      } catch (e) {
          console.error(e);
          callback(500, criteria);
      } finally {
          await client.close();
      }
  },

  GetHierarchyElementByLabel: async function(label, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    // post is of type {Author: "", Post: ""};
    // Add CreationTime to it
    let criteria = {label: label};

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const data = await client.db()
                          .collection("hierarchyElements")
                          .find( criteria )
                          .toArray();
          if (data.length)
              callback(200, data);
          else callback(404, criteria);
      } catch (e) {
          console.error(e);
          callback(500, criteria);
      } finally {
          await client.close();
      }
  },

  GetHierarchyElementChildren: async function(parentId, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    let dbid = new ObjectID(parentId);
    let criteria = {_id: dbid};

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db()
                          .collection("hierarchyElements")
                          .aggregate( [
                                    { $match: criteria },
                                    {
                                      $graphLookup: {
                                        from: "hierarchyElements",
                                        startWith:"$_id",
                                        connectFromField: "_id",
                                        connectToField: "parent",
                                        depthField: "level",
                                        as: "Childs"
                                        }
                                      }
                                    ] ).toArray();


         for await (const doc of result) {
                              console.log(doc);
          }

          let len = await result.length;

          if (len) {
            let childs = result[0].Childs;
            callback(200, childs);
          }
          else callback(404, {parentId: parentId});
      } catch (e) {
          console.error(e);
          callback(500, {parentId: parentId});
      } finally {
          await client.close();
      }
  },

  GetHierarchyElementParent: async function(id, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    let dbid = new ObjectID(id);
    let criteria = {_id: dbid};

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db()
                          .collection("hierarchyElements")
                          .aggregate( [
                                    { $match: criteria },
                                    {
                                      $graphLookup: {
                                        from: "hierarchyElements",
                                        startWith:"$parent",
                                        connectFromField: "parent",
                                        connectToField: "_id",
                                        depthField: "level",
                                        as: "Parent"
                                        }
                                      },
                                      {
                                        $project:
                                          {
                                            _id:1,
                                            parent:1,
                                            label:1,
                                            value:1,
                                            parent: "$Parent"
                                          }
                                        }
                                    ] ).toArray();


         for await (const doc of result) {
                              console.log(doc);
          }

          let len = await result.length;

          if (len) {
            let parent = result[0].parent;
            callback(200, parent);
          }
          else callback(404, {parentId: id});
      } catch (e) {
          console.error(e);
          callback(500, {parentId: id});
      } finally {
          await client.close();
      }
  },

  AddHierarchyElement: async function(label, value, parentId, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

        // Add CreationTime to it

    let parentDbId = '';

    if (parentId != '') parentDbId = new ObjectID(parentId);

    let dbPost = {
                    _id: null,
                    label: label,
                    value: value,
                    parent: parentDbId
                };

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db().collection("hierarchyElements").insertOne( dbPost );
          if (result != null) {
            callback(200, {_id: result._id});
          }
          else {
            callback(400, dbPost);
          }
      } catch (e) {
          console.error(e);
          callback(500, dbPost);
      } finally {
          await client.close();
      }
  },

  DeleteHierarchyElementById: async function(id, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    let dbid = new ObjectID(id);
    let criteria = {_id: dbid};

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          //const result = await client.db().collection("posts").deleteOne({ _id: new MongoClient.ObjectID(post._id) });
          const result = await client.db().collection("hierarchyElements").deleteOne( criteria );

          if (result.deletedCount === 1)
            callback(200, {Reason: id + " deleted"});
          else
            callback(400, {Reason: id + " NOT deleted"});
      } catch (e) {
          console.error(e);
          callback(500, {Reason: id + " NOT deleted"});
      } finally {
          await client.close();
      }
  },

  DeleteHierarchyElementByValue: async function(value, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    let criteria = { value: value};
    try {
          // Connect to the MongoDB cluster
          await client.connect();
          //const result = await client.db().collection("posts").deleteOne({ _id: new MongoClient.ObjectID(post._id) });
          const result = await client.db().collection("hierarchyElements").deleteOne( criteria );

          if (result.deletedCount === 1)
            callback(200, {Reason: value + " deleted"});
          else
            callback(400, {Reason: value + " NOT deleted"});
        } catch (e) {
          callback(500, {Reason: value + " NOT deleted"});
      } finally {
          await client.close();
      }
  },


  AddFeedback: async function(feedback, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    // post is of type {_id: "", Post: ""};
    // Add CreationTime to it
    if (feedback.Title == null || feedback.Description== null) {
      callback(420, feedback);
      return;
    }

    let entry = { Author: feedback.Author, Title: feedback.Title, Description: feedback.Description, CreatedOn: new Date() };

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db().collection("feedback").insertOne( entry );
          if (result != null)
          {
            feedbackResponse = "Thanks for the feedback. We value it. " + feedback.Author + " will receive notification of updates.."
            callback(200, {Date: entry.CreatedOn, Response: feedbackResponse, entry});
          }
          else
            callback(400, feedback);
      } catch (e) {
          console.error(e);
          callback(500, feedback);
      } finally {
          await client.close();
      }
  },


};

module.exports = databases;
