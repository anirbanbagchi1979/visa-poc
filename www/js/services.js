angular.module('starter.services', [])
        .factory('ExpensesService', function ($http, localstorage, HostMcsUrl, MCSBackendID) {
                return {
                        submitReport: function () {
                                return { success }
                        },
                        updateStatus:function(action,expense){
                          var postUrl = HostMcsUrl
                                  + '/mobile/custom/Expenses_API/expenseReport/'
                                  + expense.NotificationID + '/act';
                          var postCall = {
                                  method: 'POST',
                                  url: postUrl,
                                  data: {
                                          "Actor": localstorage.get('logged_in_user').toUpperCase(),
                                          "Action": action
                                  },
                                  headers: {
                                          'Content-Type': 'application/json',
                                          'Oracle-Mobile-Backend-Id': MCSBackendID,
                                          'Authorization': localStorage.getItem('authToken')
                                  }
                          }
                          var resp = $http(postCall);
                          return resp;
                        },
                        approve: function (expense) {
                                return this.updateStatus("APPROVED",expense);
                        },
                        decline: function (expense) {
                              return this.updateStatus("REJECTED",expense);
                        },
                        getMyExpenses: function () {
                                var getUrl = HostMcsUrl + '/mobile/custom/Expenses_API/submittedReports?userID=' + localstorage.get('logged_in_user');
                                var req = {
                                        method: 'GET',
                                        url: getUrl,
                                        data: '',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                'Oracle-Mobile-Backend-Id': MCSBackendID,
                                                'Authorization': localStorage.getItem('authToken')
                                        }
                                };
                                var resp = $http(req);
                                return resp;
                        },
                        getAwaitingApproval: function () {
                                var getUrl = HostMcsUrl + '/mobile/custom/Expenses_API/reportsForApproval?userID=' + localstorage.get('logged_in_user');
                                var req = {
                                        method: 'GET',
                                        url: getUrl,
                                        data: '',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                'Oracle-Mobile-Backend-Id': MCSBackendID,
                                                'Authorization': localStorage.getItem('authToken')
                                        }
                                };
                                var resp = $http(req);
                                return resp;
                        },
                        getLineItems: function (expenseId) {
                                var getUrl = HostMcsUrl + '/mobile/custom/Expenses_API/expenseReport/' + expenseId;
                                var req = {
                                        method: 'GET',
                                        url: getUrl,
                                        data: '',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                'Oracle-Mobile-Backend-Id': MCSBackendID,
                                                'Authorization': localStorage.getItem('authToken')
                                        }
                                }
                                var resp = $http(req);
                                return resp;

                        },
                        registerWithMCSNotifications: function (deviceToken) {
                                //alert("In get WO")
                                var getUrl = HostMcsUrl + '/mobile/platform/devices/register';



                                var req = {
                                        method: 'POST',
                                        url: getUrl,
                                        /* we should look automate this process here as well */
                                        headers: {
                                                'Content-Type': 'application/json',
                                                'Oracle-Mobile-Backend-Id': MCSBackendID,
                                                'Authorization': localStorage.getItem('authToken')

                                        },
                                        data: {
                                                'notificationToken': deviceToken,
                                                'mobileClient': {
                                                        'id': 'com.oraclecorp.internal.ent3.fusionemployeesapp',
                                                        'version': '1.0',
                                                        'platform': 'IOS'
                                                }
                                        }

                                };
                                console.log("MCS Push Registration" + JSON.stringify(req));
                                var resp = $http(req);
                                return resp;
                        }

                }
        })
        .factory('Util', function () {
                return {
                        formatDate: function (inDate) {

                                var monthNames = [
                                        "Jan", "Feb", "Mar",
                                        "Apr", "May", "Jun", "Jul",
                                        "Aug", "Sep", "Oct",
                                        "Nov", "Dec"
                                ];

                                var date = new Date(inDate);
                                var day = date.getDate();
                                var monthIndex = date.getMonth();
                                var year = date.getFullYear();

                                console.log(day, monthNames[monthIndex], year);
                                return day + ' ' + monthNames[monthIndex] + ' ' + year
                        },
                        parseNotificationForExpenseNumber: function (notification) {
                                var numbers = /(\d{6})/g.exec(notification);
                                return numbers[0];
                        },
                        mapUserNameToPortrait: function (name) {
                                if (name == "Brown, Casey" || name=="cbrown") {
                                        return "cbrown.png";
                                } else if (name == "Tucker, William" || name=="wtucker") {
                                        return "wtucker.png";
                                }else if (name=="Jones, Kerry"){
                                        return "kjones.jpg";
                                }
                                return "user.png" // default image
                        }
                };
        })
        .factory('UserAuthService', ['$window', '$location', '$http', '$rootScope',
                'HostMcsUrl', 'MCSBackendID', '$ionicHistory', '$state', 'localstorage',
                function ($window, $location, $http, $rootScope, HostMcsUrl, MCSBackendID,
                        $ionicHistory, $state, localstorage) {
                        return {
                                login: function (username, password) {

                                        // var loginUrl = HostMcsUrl + '/mobile/custom/incident/incidents/567/status';
                                        // var authHeader = 'Basic ' + btoa(username + ':' + password);
                                        var authHeader = "Basic Y2Jyb3duOkxlQ0M5QDMxMA==";
                                        // var req = {
                                        //         method: 'GET',
                                        //         url: loginUrl,
                                        //         headers: {
                                        //                 'Content-Type': 'application/json',
                                        //                 'Oracle-Mobile-Backend-Id': MCSBackendID,
                                        //                 'Authorization': authHeader
                                        //         }

                                        // };
                                        localstorage.set('logged_in_user', username.toLowerCase());
                                        localstorage.set('authToken', authHeader);
                                        $rootScope.$broadcast('event:auth-loginConfirmed');
                                        // $state.transitionTo('incidents', {}, {
                                        //                         location: true,
                                        //                         inherit: true,
                                        //                         relative: $state.$current,
                                        //                         notify: true
                                        //                 });

                                        // $http(req)
                                        //         .success(function (data) {
                                        //                 localstorage.set('logged_in_user', username);
                                        //                 localstorage.set('authToken', authHeader);
                                        //                 localstorage.setObject('workOrders', data);
                                        //                 $rootScope.$broadcast('event:auth-loginConfirmed');

                                        //                 $state.transitionTo('incidents', {}, {
                                        //                         location: true,
                                        //                         inherit: true,
                                        //                         relative: $state.$current,
                                        //                         notify: true
                                        //                 });

                                        //         })
                                        //         .error(function (keyValue) {
                                        //                 console.log(keyValue);
                                        //                 // DO NOT PUT ANYTHING HERE INSIDE, IT WILL BE HANDLED BY THE INTERCEPTOR
                                        //         });
                                },
                                logout: function () {
                                        if ($window.localStorage.getItem('logged_in_user')) {
                                                localstorage.remove('logged_in_user');
                                                $rootScope.$broadcast('event:auth-loginRequired');

                                                // clear history, BUT this DOES NOT reset the CONTROLLERS
                                                $ionicHistory.clearHistory();
                                                $ionicHistory.clearCache();
                                                // alert("logout");
                                                $state.transitionTo('login', {}, {
                                                        location: true,
                                                        inherit: true,
                                                        relative: $state.$current,
                                                        notify: true
                                                });
                                        }
                                },
                                isLoggedIn: function () {
                                        console.log('Checking if user is logged in');
                                        if ($window.localStorage.getItem('logged_in_user')) {
                                                console.log('token exists in local storage');
                                                return true;
                                        } else {
                                                console.log('token not found. user nt logged in');
                                                return false;
                                        }
                                },
                                getLoggedInUserProfile: function () {
                                        console.log('Checking if user is a service Writer');
                                        if ($window.localStorage.getItem('logged_in_user')) {
                                                console.log('token exists in local storage');
                                                var profile = {};
                                                var username = $window.localStorage.getItem('logged_in_user');
                                                if (username == 'helenMills') {
                                                        profile.username = username;
                                                        profile.name = 'Helen Mills';
                                                        profile.role = 'service_writer';
                                                } else if (username == 'casey') {
                                                        profile.username = username;
                                                        profile.name = 'Casey Brown';
                                                        profile.role = 'technician';
                                                } else if (username == 'angie') {
                                                        profile.username = username;
                                                        profile.name = 'Angie McGaha';
                                                        profile.role = 'service_writer';
                                                } else if (username == 'cbrown') {
                                                        profile.username = username;
                                                        profile.name = 'Casey Brown';
                                                        profile.role = 'service_writer';
                                                } else if (username == 'wtucker') {
                                                        profile.username = username;
                                                        profile.name = 'William Tucker';
                                                        profile.role = 'service_writer';
                                                }
                                                return profile;
                                        } else {
                                                console.log('token not found. user not logged in');
                                                return null;
                                        }
                                }


                        };
                }
        ]).factory('DeviceSvc', function () {
                var deviceInfo = {};
                return {
                        all: function () {
                                return deviceInfo;
                        },
                        setDeviceToken: function (token) {
                                deviceInfo.deviceToken = token;
                        }
                }
        })
        .factory('localstorage', ['$window', function ($window) {
                return {
                        set: function (key, value) {
                                $window.localStorage[key] = value;
                        },
                        get: function (key, defaultValue) {
                                return $window.localStorage[key] || defaultValue;
                        },
                        setObject: function (key, value) {
                                $window.localStorage[key] = JSON.stringify(value);
                        },
                        getObject: function (key) {
                                return JSON.parse($window.localStorage[key] || '{}');
                        },
                        remove: function (key) {
                                $window.localStorage.removeItem(key);
                        }
                };
        }]);
