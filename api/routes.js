//'use strict';

const controller = require('./controller');

module.exports = function(app) {
   app.route('/about')
       .get(controller.about);
   app.route('/v1/profile/get')
       .post(controller.GetProfile);
   app.route('/v1/profile/add')
       .post(controller.AddProfile);
   app.route('/v1/profile/update')
       .post(controller.UpdateProfile);
   app.route('/v1/profile/delete')
       .post(controller.DeleteProfile);
   app.route('/v1/upload')
       .post(controller.UploadFile);
   app.route('/v1/post/add')
       .post(controller.AddPost);
   app.route('/v1/post/get')
       .post(controller.GetPost);
   app.route('/v1/post/delete')
       .post(controller.DeletePost);
   app.route('/v1/app/feedback/add')
         .post(controller.Feedback);

};
