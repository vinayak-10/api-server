//'use strict';

const {MongoClient} = require('mongodb');

var databases = {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */

  GetUserProfile: async function(id, callback) {
//    const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&retryWrites=true&w=majority";
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const profile = await client.db().collection("profile").findOne( { _id: id } );
          if (profile != null)
            callback(200, profile);
          else
            callback(404, {Author: id});
      } catch (e) {
          console.error(e);
          callback(500, null);
      } finally {
          await client.close();
          //console.log("Connection to Database closed");
      }
  },

  AddUserProfile: async function(profile, callback) {
//    const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&retryWrites=true&w=majority";
    const uri = "mongodb://127.0.0.1/UserProfile";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    let entry = {_id: profile.Author, };

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
      sortOrder = -1;
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
                          .limit(5).toArray();

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

    try {
          // Connect to the MongoDB cluster
          await client.connect();
          const result = await client.db().collection("posts").deleteOne( post._id );
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


};

module.exports = databases;
