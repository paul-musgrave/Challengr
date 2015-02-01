'use strict';

// DEV: empty user when not in kik
if(kik && !kik.getUser){
  kik.getUser = function(cb){cb({})}
}

// kik.message = { challengeId: '-JgygzXxy5umT9fpcaEe'};

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin'])

  .controller('PBChallengesCtrl', ['$scope', '$timeout', '$location', 'publicChallengeList', 'fbutil', function($scope, $timeout, $location, publicChallengeList, fbutil) {

    // checkForRedirectMessage($location, $scope, $timeout);

    $scope["publicc"] = publicChallengeList;
    $scope.sort = "upvotes";
    $scope.setSort = function(type) { $scope.sort = type; };

    $scope.getEndDate = function (startDate) {
      var start_time = new Date(startDate);
      return start_time.setDate(start_time.getDate()+2);
    }

    $scope.getTimeRemaining = function (startDate,currentDate){
      var percentage_complete = $scope.percent_complete(startDate,currentDate);
      return Math.round(48*(1-percentage_complete));
    }

    $scope.percent_complete = function (startDate,currentDate){
      var endDate = $scope.getEndDate(startDate);
      return 1 - (endDate - currentDate)/(endDate-startDate);
    }

    $scope.get_completion = function (startDate){
      var currentDate = + new Date();
      return $scope.percent_complete(startDate,currentDate);
    }

    $scope.upvote = function(responseId){
      var response = fbutil.ref(path+'/responses/'+responseId);
      response.child('upvotes').transaction(function(curUpvotes){
        return curUpvotes+1;
      });
    }

    // $scope.addMessage = function(newMessage) {
    //   if( newMessage ) {
    //     $scope.messages.$add({text: newMessage});
    //   }
    // };
    $scope.chupvote = $scope.upvote = function(challengeId){
      var challenge = fbutil.ref('public-challenges').child(challengeId);
      challenge.child('upvotes').transaction(function(curUpvotes){
        return curUpvotes+1;
      });
    }

    // more hack
    window.pcscope = $scope;

    // HACK: duplicate
    if(kik.message && !kik.message.followed){
      kik.message.followed = true;
      $scope.fromShare = true;

      var path = 'public-challenges/'+kik.message.challengeId;
      $scope.challenge = fbutil.syncObject(path, {limit: 10, endAt: null});
      $scope.responses = fbutil.syncArray(path+'/responses', {limit: 10, endAt: null});

      kik.getUser(function(user){

        //TEST
        if(!user.username){user.username = 'placeholder-user'}

        fbutil.ref(path).once('value', function(v){
          fbutil.ref('users/'+user.username+'/challenged-to/'+kik.message.challengeId).set(v.val());
        });
      });

      $scope.upvote = function(responseId){
        var response = fbutil.ref(path+'/responses/'+responseId);
        response.child('upvotes').transaction(function(curUpvotes){
          return curUpvotes+1;
        });
      }

      $scope.share = function(){
        kik.pickUsers(function(users){
          if(!users){
              // action was cancelled by user
          } else {
              users.forEach(function(user){
                kik.send(user.username, {
                  // TODO: message content
                  title: 'You have been challenged to: ' + $scope.challenge.name,
                  // body: 
                  // ## TODO: don't know how to recieve this
                  data: { challengeId: $scope.challenge.$id }
                });
              });
          }
        });
      }
    }

  }])

  .controller('MyChallengesCtrl', ['$scope', '$routeParams', '$location', 'fbutil', function($scope, $routeParams, $location, fbutil) {

    // ## does this async cause a problem?
    kik.getUser(function(user){
      // TEST
      if(!user.username){user.username = 'placeholder-user'}

      var myChallenges = fbutil.syncArray('users/'+user.username+'/challenged-to', {limit: 10, endAt: null});
      $scope.challenges = myChallenges;
    });

  }])

  .controller('ChallengeCtrl', ['$scope', '$routeParams', '$location', 'fbutil', function($scope, $routeParams, $location, fbutil) {
    // ## hack
    var path = 'public-challenges/'+$routeParams['challengeId'];
    $scope.challenge = fbutil.syncObject(path, {limit: 10, endAt: null});
    $scope.responses = fbutil.syncArray(path+'/responses', {limit: 10, endAt: null});

    $scope.currentTime = + new Date();
    $scope.endingTime = new Date($scope.currentTime);

    $scope.getEndDate = function (startDate) {
      var start_time = new Date(startDate);
      return start_time.setDate(start_time.getDate()+2);
    }

    $scope.getTimeRemaining = function (startDate,currentDate){
      var percentage_complete = $scope.percent_complete(startDate,currentDate);
      return Math.round(48*(1-percentage_complete));
    }

    $scope.percent_complete = function (startDate,currentDate){
      var endDate = $scope.getEndDate(startDate);
      return 1 - (endDate - currentDate)/(endDate-startDate);
    }

    $scope.upvote = function(responseId){
      var response = fbutil.ref(path+'/responses/'+responseId);
      response.child('upvotes').transaction(function(curUpvotes){
        return curUpvotes+1;
      });
    }

    $scope.share = function(){
      kik.pickUsers(function(users){
        if(!users){
            // action was cancelled by user
        } else {
            users.forEach(function(user){
              kik.send(user.username, {
                // TODO: message content
                title: 'You have been challenged to: ' + $scope.challenge.name,
                // body: 
                // ## TODO: don't know how to recieve this
                data: { challengeId: $scope.challenge.$id }
              });
            });
        }
      });
    }
  }])

  .controller('ResponseCtrl', ['$scope', '$routeParams', '$location', 'fbutil', function($scope, $routeParams, $location, fbutil) {
    // ## always public
    var responsesRef = fbutil.ref('public-challenges/'+$routeParams['challengeId']+'/responses');

    $scope.createResponse = function(){
      responsesRef.push(createResponseObject(), function(){
        $location.path('/public-challenges');
      });
    };
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

      // 
      challengeData.responses = {
        authorResponse: createResponseObject()
      };

      // ## for now, just do this kikwise
      kik.getUser(function(user){
        // ## should do this, but for debug purposes don't
        // if(!user){
        //   alert('You need to login to submit a challenge!');
        // } else {
          // TEST
          if(!user.username){user.username = 'placeholder-user'}

          challengeData.submittedBy = user.username;
          challengeData.thumbUrl = user.thumbnail || 'no thumbnail';
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

  .controller('HomeCtrl', ['$scope', '$timeout', '$location', 'fbutil', 'user', 'FBURL', function($scope, $timeout, $location, fbutil, user, FBURL) {
    // checkForRedirectMessage($location, $scope, $timeout);

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

// ## EXTREME HACK
function checkForRedirectMessage($location, $scope, $timeout){
  if(kik.message && !kik.message.followed){
    if(kik.message.redirectTo){
      // $timeout(function(){
        console.log('t');
        kik.message.followed = true;
        // $location.path(kik.message.redirectTo);
        // $scope.$apply();

        // window.location.href = window.location.origin+window.location.pathname+'#/'+kik.message.redirectTo;
        // window.location.reload();
        setTimeout(function(){
          var a = document.createElement("a");
          a.href = "#"+kik.message.redirectTo;
          a.id = "redir";
          document.body.appendChild(a);
          setTimeout(function(){
            angular.element('#redir').trigger('click');
          }, 100);
        }, 5000);

      // }, 0);
    }
  }
}

function setUser(){
  kik.getUser(function(user){
    window.kikuser = user;
  });
}

function createResponseObject(){
  return {
    videoUrl: window.video_url || 'no video',
    thumbUrl: (window.kikuser && window.kikuser.thumbnail) || 'no thumbnail',
    submittedBy: (window.kikuser && window.kikuser.username) || 'placeholder-user',
    submittedAt: +new Date(),
    upvotes: 0
  };
}
