//'use strict';

var controllers = {

   function(app) {
        var myApp = app;
   },

   about: function(req, res) {

       var properties = require('../package.json')

       var aboutInfo = {
           name: properties.name,
           version: properties.version
       }
       res.json(aboutInfo);
    },

    UploadFile: function(req, res) {
      const Uploader = require('./fileUploader');

      Uploader.UploadFile(req, res);
    },

    Authenticate: function(req, res) {
        const ProfileService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        ProfileService.Authenticate(req, res);
    },


    GetProfile: function(req, res) {
        const ProfileService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        ProfileService.GetUserProfile(req, res);
    },

    AddProfile: function(req, res) {
        const ProfileService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        ProfileService.AddUserProfile(req, res);
    },

    UpdateProfile: function(req, res) {
        const ProfileService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        ProfileService.UpdateUserProfile(req, res);
    },

    DeleteProfile: function(req, res) {
        const ProfileService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        ProfileService.DeleteUserProfile(req, res);
    },

    AddPost: function(req, res) {
        const PostService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        PostService.AddUserPost(req, res);
    },

    GetPost: function(req, res) {
        const PostService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        PostService.GetUserPost(req, res);
    },

    DeletePost: function(req, res) {
        const PostService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        PostService.DeleteUserPost(req, res);
    },


      GetHierarchyElement: function(req, res) {
          const HierarchyService = require('./service');

          // Get user name from the request body
          // Call GetUserPost from the Service
          HierarchyService.GetHierarchyElement(req, res);
      },

      AddHierarchyElement: function(req, res) {
          const HierarchyService = require('./service');

          // Get user name from the request body
          // Call GetUserPost from the Service
          HierarchyService.AddHierarchyElement(req, res);
      },

      UpdateHierarchyElement: function(req, res) {
          const HierarchyService = require('./service');

          // Get user name from the request body
          // Call GetUserPost from the Service
          HierarchyService.UpdateHierarchyElement(req, res);
      },

      DeleteHierarchyElement: function(req, res) {
          const HierarchyService = require('./service');

          // Get user name from the request body
          // Call GetUserPost from the Service
          HierarchyService.DeleteHierarchyElement(req, res);
      },


    AppFeedback: function(req, res) {
        const PostService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        PostService.AddFeedback(req, res);
    },

    GetRandomImage: function(req, res) {
        const PostService = require('./service');

        // Get user name from the request body
        // Call GetUserPost from the Service
        PostService.GetRandomImage(req, res);
    },
};

module.exports = controllers;
