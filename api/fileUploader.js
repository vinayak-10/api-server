//'use strict';

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
//  filename: function (req, file, cb) {
//    cb(null, Date.now() + file.originalname);
//  },
});

const upload = multer({ storage: storage, limits: { fileSize: 10*1024*1024 } }).single("upload_file");

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
