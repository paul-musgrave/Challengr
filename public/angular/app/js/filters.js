'use strict';

/* Filters */

angular.module('myApp.filters', [])
   .filter('interpolate', ['version', function(version) {
      return function(text) {
         return String(text).replace(/\%VERSION\%/mg, version);
      }
   }])

   .filter('publicOnly', function() {
      return function(challenges) {
         return Array.prototype.filter.call(challenges, function(challenge){
            return !challenge.isPrivate;
         });
      };
   })

   .filter('reverse', function() {
      return function(items) {
         return items.slice().reverse();
      };
   });
