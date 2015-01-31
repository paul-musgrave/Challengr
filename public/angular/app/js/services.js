(function() {
   'use strict';

   /* Services */

   angular.module('myApp.services', [])

      // put your services here!
      // .service('serviceName', ['dependency', function(dependency) {}]);

    .factory('publicChallengeList', ['fbutil', function(fbutil) {
       return fbutil.syncArray('public-challenges', {limit: 10, endAt: null});
     }])

    // --- 
     .factory('messageList', ['fbutil', function(fbutil) {
       return fbutil.syncArray('messages', {limit: 10, endAt: null});
     }]);

})();

