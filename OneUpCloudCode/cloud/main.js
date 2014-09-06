
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("requestFriend", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var query = new Parse.Query(Parse.User);
                   query.get(request.params.requestedUserID,
                   {
                             success: function(receiver){
                                var Request = Parse.Object.extend("Request");
                                var request = new Request();
                                request.set("receiver", receiver);
                                request.set("sender", request.user);
                                request.set("type", "kFriendRequest");
                                request.save(null, {
                                    success: function(request){
                                             response.success("Friend Requested!");
                                    },
                                    error: function(object, error){
                                             
                                    }
                                });
                             },
                             error: function(object, error){
                                             response.error(error.message);
                             }
                   
                    });
});


Parse.Cloud.define("addFriend", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var query = new Parse.Query(Parse.User);
                   var receiver = request.user;
                   query.get(request.params.requestedUserID,
                   {
                             success: function(sender){
                                var receiverRelation = receiver.relation("friends");
                                var senderRelation = sender.relation("friends");
                                senderRelation.add(receiverRelation);
                                receiverRelation.add(senderRelation);
                                sender.save(null, {
                                            success: function(sender){
                                                receiver.save(null,{
                                                              success: function(sender){
                                                                var Notification = Parse.Object.extend("Notification");
                                                                var notification = new Notification();
                                                                notification.set("receiver", receiver);
                                                                notification.set("sender", sender);
                                                                notification.set("type", "kFriendRequestAccepted");
                                                                response.success();
                                                              }
                                                });
                                            }
                                });
                             },
                             error: function(object, error) {
                                response.error(error);
                             }
                             
                             
                    });
});

//CONTEST SECTION////////////////////////
/////////////////////////////////////////

Parse.Cloud.define("voteForMedia", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var voter = request.user;
                   var Post = Parse.Object.extend("Post");
                   var query = new Parse.Query(Post);
                   query.get(request.objectID,
                   {
                             success: function(post){
                                var postRelation = post.relation("voters")
                                postRelation.add(voter);
                                post.voteCount += 1;
                                post.save(null, {
                                          success: function(post){
                                            alert("Post Saved W/ Object Id " + post.id);
                                          },
                                          error: function(post){
                                            alert("Save Failed W/ Error MSG " + error.message);
                                          }
                                });
                             
                             },
                             error: function(object, error){
                             
                             }
                             
                    });
                   
                   
});
//request is a contest - omgz need moar comments becuz ill never remember all of this
//side note - if we win ill be so happy
//hope somebody reads my code and finds this
//tell me good job at (269) 808 4388 kthxbai
Parse.Cloud.define("contestInviteAll", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var Contest = Parse.Object.extend("Contest");
                   var query = new Parse.Query(Contest);
                   query.get(request.contestID,
                   {
                             success: function(contest){
                                for (var participant in contest.participants){
                                    var Invite = Parse.Object.extend("Invite");
                                    var invite = new Invite();
                                    invite.set("sender", contest.owner);
                                    invite.set("reciever", participant);
                                    invite.set("type", "kContestInvite");
                                    invite.save(null, {
                                                success: function(invite){
                                                    alert("Invite Saved w/ ID " + invite.id);
                                                },
                                                error: function(object, error){
                                                    alert("Invite Failed to Save w/ MSG " + error.message);
                                                }
                                    });
                                }
                                //ADD NEWSFEED OBJECT //Should there bee a NF object when somone is invited?
                                var NewsFeed = Parse.Object.extend("NewsFeed");
                                var newsfeed = new NewsFeed();
                                newsfeed.set("type", "NewContest");
                                newsfeed.set("relatedObjectID", contest);
                                newsfeed.save(null, {
                                              success: function(newsfeed){
                                                response.success;
                                              }
                                });
                                ///////////////
                             },
                             error: function(object, error){
                             
                             }
                    });
                   
                   
});

Parse.Cloud.define("networkInvite", function(request,response) {
                   Parse.Cloud.useMasterKey();
                   var MassNetworkInvitation = Parse.Object.extend("MassNetworkInvitation");
                   var query = new Parse.query(MassNetworkInvitation);
                   query.get(request.params.massNetworkInvitationID,
                   {
                             success: function(massNetworkInvitation){
                                for (var user in massNetworkInvitation.users){
                                    var Invite = Parse.Object.extend("Invite");
                                    var invite = new Invite();
                                    invite.set("sender", massNetworkInvitation.owner);
                                    invite.set("receiver", user);
                                    invite.set("type", "kNetworkInvite");
                                    invite.save(null, {
                                         success: function(invite){
                                                alert("Invite Saved w/ ID " + invite.id);
                                         },
                                         error: function(object, error){
                                                alert("Invite Failed to Save w/ MSG " + error.message);
                                         }
                                    });

                                }
                             },
                             error: function(object, error){
                             
                             }
                   });
                   
});

Parse.Cloud.define("contestReadyForVoting", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var Contest = Parse.Object.extend("Contest");
                   var query = new Parse.query(Contest);
                   query.get(request.params.contestID,
                   {
                             success: function(contest){
                                contest.set("isVotingPeriod", true);
                                var Notification = Parse.Object.extend("Notification");
                                for (var participant in contest.participants){
                                    var notification = new Notification();
                                    notification.set("receiver", participant);
                                    notification.set("type", "kContestReadyForVoting");
                                    notification.set("contest", request.params.contestID);
                                    notification.save(null, {
                                         success: function(notification){
                                         alert("notification Saved w/ ID " + invite.id);
                                         },
                                         error: function(object, error){
                                         alert("notification Failed to Save w/ MSG " + error.message);
                                         }
                                         });

                             
                                }
                                if (contest.isDuel == true){
                                    var NewsFeed = Parse.Object.extend("NewsFeed");
                                    var newsfeed = NewsFeed();
                                    newsfeed.set("type", "DuelReady");
                                    newsfeed.set("relatedObjectID", contest);
                                    newsfeed.save(null, {
                                           success: function(newsfeed){
                                           
                                           },
                                           error: function(object, error){
                                           
                                           }
                                    });
                                }
                             },
                             error: function(object, error){
                             
                             }
                    
                             
                    });
                   
                   
                   
});

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

//Requires a Post
Parse.Cloud.define("updateGeneralStatistics", function(request, response) {
                   var user = request.params.owner;
                   var Statistics = Parse.Object.extend("Statistics");
                   var query = new Parse.Query(Statistics);
                   query.get(user.statisticID,
                   {
                             success: function(statistic) {
                             
                                statistic.set("totalContest", tatistic.totalContest+1);
                                statistic.set("votesReceived", statistic.votesReceived+request.params.voteCount);
                                statistic.set("totalPosts", statistic.totalPosts+1);
                             
                             },
                             error: function(object, error){
                             
                             }
                             
                             
                   });
                   
});

Parse.Cloud.define("updateWisdomStatistics", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   for (var user in request.params.voters){
                        var Statistics = Parse.Object.extend("Statistics");
                        var query = new Parse.Query(Statistics)
                        query.get(user.statisticID, {
                                  success: function(statistic){
                                        statistic.set("totalWinnersPicked", statistic.totalWinnersPicked+1);
                                        statistic.set("wisdom", statistic.totalWinnersPicked/statistic.totalContests);
                                  },
                                  error: function(object, error){
                                  
                                  }
                        });
                   }
                   
                   
                   
});

Parse.Cloud.define("updateWinnerStatistics", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var Statistics = Parse.Object.extend("Statistics");
                   var query = new Parse.Query(Statistics);
                   query.get(request.params.owner, {
                             success: function(statistics){
                                statistics.set("totalWins", statistics.totalWins+1);
                             },
                             error: function(object, error){
                             
                             }
                   
                             
                   });
                   
});

Parse.Cloud.define("contestCalculateResults", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var Contest = Parse.Object.extend("Contest");
                   var query = new Parse.Query(Contest);
                   query.get(request.params.contestID, {
                             success: function(contest){
                                var currentBest = Parse.Object.extend("Post");
                                currentBest.set("voteCount", 0);
                                for (var post in contest.posts){
                                    if (post.voteCount > currentBest.voteCount){
                                        currentBest = post;
                                    }
                                    updateGeneralStatistics(post);
                                }
                                updateWisdomStatistics(currentBest);
                                updateWinnerStatistics(currentBest);
                            
                             
                             },
                             error: function(object, error){
                             
                             }
                   });
                   
});


///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


Parse.Cloud.define("contestEnded", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var Contest = Parse.Object.extend("Contest");
                   var query = new Parse.Query(Contest);
                   query.get(request.params.contestID,
                   {
                             success: function(contest){
                                contest.set("isVotingPeriod", false);
                                contest.set("isActive", false);
                                var Notification = Parse.Object.extend("Notification");
                                for (var participant in contest.participants){
                                    var notification = new Notification();
                                    notification.set("receiver", participant);
                                    notification.set("type", "kContestEnded");
                                    notification.set("contest", request.params.contestID);
                                    notification.save(null, {
                                                success: function(notification){
                                                    alert("notification Saved w/ ID " + invite.id);
                                                },
                                                error: function(object, error){
                                                    alert("notification Failed to Save w/ MSG " + error.message);
                                                }
                             
                                    });
                                }
                   
                             },
                             error: function(object, error){
                             
                             }
                             
                    });
                   
});



Parse.Cloud.job("contestMonitor", function(request, status) {
                Parse.Cloud.useMasterKey();
                var Contest = Parse.Object.extend("Contest");
                var query = Parse.Query(Contest);
                query.each(function(contest) {
                           if (contest.startDate > contest.endDate){
                            contestCalculateResults(contest);
                            contestEnded(contest);
                            contest.save(null, {
                                        success: function(contest){
                                        
                                        },
                                        error: function(object, error){
                                        
                                        }
                            });
                           }
                           
                });
                status.success();
});



