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
            criteria = { permissions: { $in: permissions} };
          } else {
            criteria = { _id: { $in: authors} }; //, permissions: { $in: permissions} };
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
                              Permissions: item.permissions,
                              postCount: count, recentPost: recent });
                } else {
                  jsonA.push({Author: item._id, name: item.name, Permissions: item.permissions,
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

    profile.permissions = {
        posts: {
          w: [],
          r: null
        }
    };

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
    const dbNodeId = new ObjectID(post.NodeId);

    let dbPost = { _id: null, NodeId: dbNodeId ,Author: post.Author, Post: post.Post, CreatedOn: new Date() };

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

  GetPostByNodeId: async function(post, limit, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    // post is of type {Author: "", Post: ""};
    // Add CreationTime to it
    let criteria = {};
    let sortOrder = 0;

    const dbNodeId = new ObjectID(post.NodeId);

    if (!post.hasOwnProperty('CreatedOn')) {
      criteria = { NodeId: dbNodeId };
      sortOrder = 1;
    }
    else if (post.Direction == 'next') {
        criteria = { NodeId: post.NodeId, CreatedOn: { $gt: new Date(post.CreatedOn) } };
        sortOrder = 1;
    } else {
      criteria = { NodeId: post.NodeId, CreatedOn: { $lt: new Date(post.CreatedOn) } };
      sortOrder = -1;
    }

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const data = await client.db()
                          .collection("posts")
                          .find( criteria )
                          .sort( { CreatedOn: sortOrder } )
                          .limit(limit).toArray();
                          //.toArray();
          if (data.length) {
              callback(200, data);
            }
          else callback(404, post);
      } catch (e) {
          console.error(e);
          callback(500, post);
      } finally {
          await client.close();
      }
  },

  GetUserPermissions: async function(author, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    const criteria = {_id: author};
    const options = {
      // Include only the `title` and `imdb` fields in the returned document
      projection: { _id: 0, permissions: 1 },
    };

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const data = await client.db()
                          .collection("profile")
                          .findOne( criteria );

          if (data != null) {
              callback(200, data.permissions.posts);
            }
          else callback(404, author);
      } catch (e) {
          console.error(e);
          callback(500, author);
      } finally {
          await client.close();
      }
  },


  GetUserSubscribedPost: async function(post, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    // post is of type {Author: "", Post: ""};
    // Add CreationTime to it
    let criteria = {};
    let sortOrder = 0;

    let wNodeIds = [''];
    let rNodeIds = [''];
    // Get the list of Keys ( NodeIds ) that this user Serves
    await databases.GetUserPermissions(post.Author, function(retval, p) {
          if (retval == 200) {
              // Read Write Permission Keys & Read Permission Keys
              wNodeIds = p.w;
              rNodeIds = p.r;
          }
    });
    // Put them in Array
    let posts = { w: [],
                  r: []
                };

    if (wNodeIds != null && wNodeIds.length != 0) {
        let nodes = [];
        await databases.GetHierarchyElementById(wNodeIds, function(retval, p) {
                      if (retval == 200) {
                            console.log("GetUserSubscribedPost: p: " + p);
                            for (const doc of p) {
                              nodes.push({ NodeId: doc._id, label: doc.label, value: doc.value, parent: doc.parent});
                            }
                      }
              });

        console.log("GetUserSubscribedPost: w nodes: " + JSON.stringify(nodes));

        for (const doc of nodes) {

            await databases.GetPostByNodeId( { NodeId: doc.NodeId}, 1,  function(retval, p) {
                    if (retval == 200) {
                        posts.w.push( { Node: doc, Posts: p } );
                    }
              });
        }
    }

    if (rNodeIds != null && rNodeIds.length != 0) {
        let nodes = [];
        await databases.GetHierarchyElementById(rNodeIds, function(retval, p) {
                      if (retval == 200) {
                            console.log("GetUserSubscribedPost: p: " + p);
                            for (const doc of p) {
                              nodes.push({ NodeId: doc._id, label: doc.label, value: doc.value, parent: doc.parent});
                            }
                      }
              });

        console.log("GetUserSubscribedPost: r nodes: " + JSON.stringify(nodes));

        for (const doc of nodes) {

            await databases.GetPostByNodeId( { NodeId: doc.NodeId}, 1,  function(retval, p) {
                    if (retval == 200) {
                        posts.r.push( { Node: doc, Posts: p } );
                    }
              });
        }
    }

      const postsCount = posts.w.length + posts.r.length;

      if (postsCount) {
        callback(200, posts);
      } else {
        callback(404, post.author);
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

  GetHierarchyElementById: async function(ids, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    let dbids = [];

    for (const doc of ids) {
        dbids.push(new ObjectID(doc));
     }
     let criteria = {_id: {$in : dbids}};

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

    GetHierarchyElementsByUser: async function(author, reportType, callback) {
      const uri = "mongodb://127.0.0.1/UserProfile";
      const client = new MongoClient(uri, { useNewUrlParser: true });

      let wNodeIds = [];
      let rNodeIds = [];
      // Get the list of Keys ( NodeIds ) that this user Serves
      await databases.GetUserPermissions(author, function(retval, p) {
            if (retval == 200) {
                // Read Write Permission Keys & Read Permission Keys
                wNodeIds = p.w;
                rNodeIds = p.r;
            }
      });
      // Put them in Array

      let hierarchyElements = {w: [], r: []};

      if ( wNodeIds && wNodeIds.length ) {
          await databases.GetHierarchyElementById( wNodeIds, function(retval, p) {
                      if (retval == 200) {
                          hierarchyElements.w = p;
                      }
                });
        }

      if ( rNodeIds && rNodeIds.length ) {
         await databases.GetHierarchyElementById( wNodeIds, function(retval, p) {
                       if (retval == 200) {
                           hierarchyElements.r = p;
                       }
                 });
      }

      let hierarchyElementsCount = hierarchyElements.w.length + hierarchyElements.r.length;

      // If there are hierarchyElements;
      // Add Most Recent Post to it if reportType = detailed
      // Otherwise; pass the message as is to the client

      if (hierarchyElementsCount) {
          callback(200, hierarchyElements);
        }
      else {
        callback(404, {Author: author});
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
                                      },
                                      {
                                        $project:
                                          {
                                            _id:1,
                                            parent:1,
                                            label:1,
                                            value:1,
                                            children: "$Childs"
                                          }
                                      }
                                    ] ).toArray();


         for await (const doc of result) {
                              console.log(doc);
          }

          let len = await result.length;

          if (len) {
            callback(200, result);
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

  AddHierarchyElement: async function(author, label, value, parentId, callback) {
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

        // Add CreationTime to it

    let parentDbId = '';

    if (parentId != '') parentDbId = new ObjectID(parentId);

    let hdbPost = {
                    _id: null,
                    label: label,
                    value: value,
                    parent: parentDbId,
                    permissions: {
                        posts: {
                                w: [author], // Author is Creator and Writer
                                r: null      // World Readable. if r=[]; means its private; Not readable to anyone
                              }
                      }
                };

    // Add Profile for the Author if its not already present
    // Update its Permissions with the hierarhy key as "cw"
    // Connect to the MongoDB cluster
    await client.connect();

    // Step 1: Start a Client Session
   const session = client.startSession();

    try {
           // Step 2: Optional. Define options to use for the transaction
           const transactionOptions = {
             readPreference: 'primary',
             readConcern: { level: 'local' },
             writeConcern: { w: 'majority' }
           };

           await session.withTransaction(async () =>
            {

              const i1 = await client.db().collection("hierarchyElements").insertOne( hdbPost );
              let hierarchyId =  i1.insertedId;
              console.log("Added hid: " + hierarchyId );

              const filter = { _id: author };

              const i2 = await client.db().collection("profile").find( filter ).toArray();
              if (i2)
                console.log("Got id: " + i2.length ? i2[0] : "Not Found" );
              else console.log("Didn't got user: " + author);

              if (i2.length) {
                // found existing Profile
                // update the Permissions there.
                i2[0].permissions.posts.w.push(hierarchyId);

                const updateDocument = { $set: i2[0] };
                const result = await client.db().collection("profile").updateOne(filter, updateDocument );

              } else {
                let profile = {
                  _id: author,
                  permissions: {
                    posts: {
                         w: [ hierarchyId ],
                         r: null
                    }
                  }
                };
                const i3 = await client.db().collection("profile").insertOne( profile );
              }

              // If control is here; it means all db operations are successful
              callback(200, { _id: hierarchyId });

            } , transactionOptions );

        } catch (e) {
             console.error(e);
             callback(500, hdbPost);
        } finally {
            await session.endSession();
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
