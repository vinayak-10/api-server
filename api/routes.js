//'use strict';

const controller = require('./controller');

module.exports = function(app) {
   app.route('/about')
       .get(controller.about);
   app.route('/v1/auth')
       .post(controller.Authenticate);
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

   app.route('/v1/hierarchy/elements/get')
       .post(controller.GetHierarchyElement);
   app.route('/v1/hierarchy/elements/add')
       .post(controller.AddHierarchyElement);
   app.route('/v1/hierarchy/elements/update')
       .post(controller.UpdateHierarchyElement);
   app.route('/v1/hierarchy/elements/delete')
       .post(controller.DeleteHierarchyElement);
/*
   app.route('/v1/hierarchy/elements/info/get')
       .post(controller.GetHierarchyElementInfo);
   app.route('/v1/hierarchy/elements/info/add')
       .post(controller.AddHierarchyElementInfo);
   app.route('/v1/hierarchy/elements/info/update')
       .post(controller.UpdateHierarchyElementInfo);
   app.route('/v1/hierarchy/elements/info/delete')
       .post(controller.DeleteHierarchyElementInfo);
*/
   app.route('/v1/app/feedback/add')
         .post(controller.AppFeedback);
   app.route('/v1/app/random-image')
         .get(controller.GetRandomImage);
};
