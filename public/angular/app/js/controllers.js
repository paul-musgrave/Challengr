'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin'])

  .controller('PBChallengesCtrl', ['$scope', 'publicChallengeList', 'fbutil', function($scope, publicChallengeList, fbutil) {
    $scope["publicc"] = publicChallengeList;
    // $scope.addMessage = function(newMessage) {
    //   if( newMessage ) {
    //     $scope.messages.$add({text: newMessage});
    //   }
    // };
    $scope.upvote = function(challengeId){
      var challenge = fbutil.ref('public-challenges').child(challengeId);
      challenge.child('upvotes').transaction(function(curUpvotes){
        return curUpvotes+1;
      });
    }
  }])

  .controller('ChallengeCreateCtrl', ['$scope', '$location', 'fbutil', function($scope, $location, fbutil) {
    // ## always public
    var publicChallengesRef = fbutil.ref('public-challenges');

    //#?
    $scope.newchallenge = {};

    $scope.createChallenge = function(challengeData){
      //TODO: validation (on form with angular somehow?)

      // TODO: video. also thumbnail

      challengeData.upvotes = 0;
      challengeData.startDate = +new Date();
      challengeData.videoUrl = window.video_url;
      // ## for now, just do this kikwise
      kik.getUser(function(user){
        // ## should do this, but for debug purposes don't
        // if(!user){
        //   alert('You need to login to submit a challenge!');
        // } else {
          challengeData.submittedBy = user.username;

          publicChallengesRef.push(challengeData, function(){
            ///TODO
            console.log('submitted!');
            $location.path('/public-challenges');
          });
        // }
      });

    }
    // $scope.addMessage = function(newMessage) {
    //   if( newMessage ) {
    //     $scope.messages.$add({text: newMessage});
    //   }
    // };
  }])

  // --- 
  .controller('HomeCtrl', ['$scope', 'fbutil', 'user', 'FBURL', function($scope, fbutil, user, FBURL) {
    $scope.syncedValue = fbutil.syncObject('syncedValue');
    $scope.user = user;
    $scope.FBURL = FBURL;
  }])

  .controller('ChatCtrl', ['$scope', 'messageList', function($scope, messageList) {
    $scope.messages = messageList;
    $scope.addMessage = function(newMessage) {
      if( newMessage ) {
        $scope.messages.$add({text: newMessage});
      }
    };
  }])

  .controller('LoginCtrl', ['$scope', 'simpleLogin', '$location', function($scope, simpleLogin, $location) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;

    $scope.login = function(email, pass) {
      $scope.err = null;
      simpleLogin.login(email, pass)
        .then(function(/* user */) {
          $location.path('/account');
        }, function(err) {
          $scope.err = errMessage(err);
        });
    };

    $scope.createAccount = function() {
      $scope.err = null;
      if( assertValidAccountProps() ) {
        simpleLogin.createAccount($scope.email, $scope.pass)
          .then(function(/* user */) {
            $location.path('/account');
          }, function(err) {
            $scope.err = errMessage(err);
          });
      }
    };

    function assertValidAccountProps() {
      if( !$scope.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.pass || !$scope.confirm ) {
        $scope.err = 'Please enter a password';
      }
      else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code? err.code : err + '';
    }
  }])

  .controller('AccountCtrl', ['$scope', 'simpleLogin', 'fbutil', 'user', '$location',
    function($scope, simpleLogin, fbutil, user, $location) {
      // create a 3-way binding with the user profile object in Firebase
      var profile = fbutil.syncObject(['users', user.uid]);
      profile.$bindTo($scope, 'profile');

      // expose logout function to scope
      $scope.logout = function() {
        profile.$destroy();
        simpleLogin.logout();
        $location.path('/login');
      };

      $scope.changePassword = function(pass, confirm, newPass) {
        resetMessages();
        if( !pass || !confirm || !newPass ) {
          $scope.err = 'Please fill in all password fields';
        }
        else if( newPass !== confirm ) {
          $scope.err = 'New pass and confirm do not match';
        }
        else {
          simpleLogin.changePassword(profile.email, pass, newPass)
            .then(function() {
              $scope.msg = 'Password changed';
            }, function(err) {
              $scope.err = err;
            })
        }
      };

      $scope.clear = resetMessages;

      $scope.changeEmail = function(pass, newEmail) {
        resetMessages();
        var oldEmail = profile.email;
        profile.$destroy();
        simpleLogin.changeEmail(pass, oldEmail, newEmail)
          .then(function(user) {
            profile = fbutil.syncObject(['users', user.uid]);
            profile.$bindTo($scope, 'profile');
            $scope.emailmsg = 'Email changed';
          }, function(err) {
            $scope.emailerr = err;
          });
      };

      function resetMessages() {
        $scope.err = null;
        $scope.msg = null;
        $scope.emailerr = null;
        $scope.emailmsg = null;
      }
    }
  ]);
