
angular.module('starter', ['ionic', 'ionic.service.core', 'ngCordova', 'starter.controllers', 'starter.services'])
        .constant('HostMcsUrl', 'https://mobileportalsetrial0004dev-mcsdem0004.mobileenv.us2.oraclecloud.com:443')
        .constant('MCSBackendID', '9f01fa45-2024-4b76-9af2-1afb75654c0b')
        .run(function ($ionicPlatform, $ionicPopup, $state,ExpensesService,UserAuthService,Util,DeviceSvc) {
                $ionicPlatform.ready(function () {

                        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                                cordova.plugins.Keyboard.disableScroll(true);

                        }
                        if (window.StatusBar) {
                                // org.apache.cordova.statusbar required
                                StatusBar.styleLightContent();
                        }

                        // This code will invoke the Cordova push notification plugin and will take care of the
                        // device handshake with APN and GCM . The onRegister callback will contain the device token
                        // that has to be supplied/ registered with  mobile backend that will generate the notification
                        // message

                        Ionic.io();
                        var push = new Ionic.Push();
                        /**
                        * Init method to setup push behavior/options
                        *
                        * The config supports the following properties:
                        *   - debug {Boolean} Enables some extra logging as well as some default callback handlers
                        *   - onNotification {Function} Callback function that is passed the notification object
                        *   - onRegister {Function} Callback function that is passed the registration object
                        *   - onError {Function} Callback function that is passed the error object
                        *   - pluginConfig {Object} Plugin configuration: https://github.com/phonegap/phonegap-plugin-push
                        *
                        * @param {object} config Configuration object
                        * @return {Push} returns the called Push instantiation
                        */
                        push.init({
                                "debug": false,
                                "onNotification": function (notification) {
                                        var payload = notification.payload;
                                        var expenseId = Util.parseNotificationForExpenseNumber(notification.text);
                                        console.log(notification, payload);
                                        // The App is in the foreground, display the notification in the app in an
                                        // Ionic alert popup
                                        if (notification.foreground == true) {
                                          // Play custom audio if a sound specified. Using NATIVEAUDIO PLUGIN
                                          // if (notification.sound) {
                                          //     $rootScope.playNotificationSound();
                                          // }
                                          var alertPopup = $ionicPopup.confirm({
                                                  title: "New Expense awaiting approval: " ,
                                                  template: "View number " + expenseId + " ?"
                                          });
                                          // When the Alert OK button is pressed
                                          // natigate to and refresh the waiting
                                          // approvals list and place
                                          // focus on and expand the new expense
                                          // that we were notified about.
                                          alertPopup.then(function (res) {
                                            if(res){
                                                     $state.go('tab.awaiting',
                                                      { id: expenseId ,
                                                       random: Math.random() });
                                                   } else {
                                                     console.log('You are not sure');
                                                   }
                                          });
                                        }else {
                                          // The app was in the background and will
                                          // be taken to the front . Here we
                                          // have to check if we're logged in .
                                          // If yes we do not need to show the
                                          // notification and we can just move to
                                          // the list of expenses awaiting
                                          // approval . If we're not logged in
                                          // we need to record the expense #
                                          // to focus on and we need to first
                                          // Go to the login form for the user
                                          // to log in .
                                           if( UserAuthService.isLoggedIn()){
                                             // Will this reload the list of
                                             // expenses awaiting approval
                                             var alertPopup = $ionicPopup.confirm({
                                                     title: "New Expense awaiting approval: ",
                                                     template: "View number " + expenseId + " ?"
                                             });
                                             alertPopup.then(function (res) {
                                               if(res){
                                                        $state.go('tab.awaiting',
                                                         { id: expenseId,
                                                            random: Math.random()  });
                                                      } else {
                                                        console.log('You are not sure');
                                                      }
                                             });
                                           }else{
                                             $state.go('login', { id: expenseId });
                                           }
                                        }
                                },
                                "onRegister": function (data) {
                                        console.log(data.token);
                                        DeviceSvc.setDeviceToken(data.token);
                                },
                                "pluginConfig": {
                                                  "android": {},
                                                  "ios": {"alert": "true",
                                                          "badge": "true",
                                                          "sound": "true"},
                                                  "windows": {}
                                                }
                        });

                        /**
                        * Registers the device with GCM/APNS to get a device token
                        * Fires off the 'onRegister' callback if one has been provided in the init() config
                        * @param {function} callback Callback Function
                        * @return {void}
                        * **/
                        push.register(function (token) {
                                console.log("APN Device Registration Success , Device token:", token.token);

                        });

                });
        })
        .config(function ($stateProvider, $urlRouterProvider, $ionicAppProvider) {

                // $stateProvider

                $stateProvider
                        .state('login', {
                                url: "/login?id",
                                templateUrl: "templates/login.html",
                                controller: 'LoginController'
                        })
                        .state('expenseReport', {
                                url: "/expenseReport",
                                templateUrl: "templates/expenseReport.html",
                                controller: 'ExpenseReportCtrl'
                        })
                // setup an abstract state for the tabs directive
                        .state('tab', {
                                url: "/tab",
                                abstract: true,
                                templateUrl: "templates/tabs.html"
                        })
                // Each tab has its own nav history stack:
                        .state('tab.my', {
                                url: '/my',
                                views: {
                                        'tab-my': {
                                                templateUrl: 'templates/myExpenses.html',
                                                controller: 'MyReportCtrl'
                                        }
                                }
                        })
                        .state('tab.awaiting', {
                                url: '/awaiting/:id?random',
                                views: {
                                        'tab-awaiting': {
                                                templateUrl: 'templates/awaitingApproval.html',
                                                controller: 'AwaitingApprovalCtrl'
                                        }
                                }
                        });

                // $urlRouterProvider.otherwise('/login');
                $urlRouterProvider.otherwise('/login');
        });
