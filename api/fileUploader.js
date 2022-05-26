//'use strict';

const multer = require('multer');
const upload = multer({dest:'uploads/'}).single("upload_file");

var uploader = {

   function(app) {
        var myApp = app;
   },

   UploadFile: function(req, res) {
      upload(req, res, (err) => {
        if(err) res.status(400).send("Something went wrong!");
        else res.send( req.file );
      });
    },

};

module.exports = uploader;
