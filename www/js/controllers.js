angular.module('starter.controllers', [])
        .controller('MyReportCtrl', function ($scope, ExpensesService, UserAuthService, $ionicLoading,Util) {

                $ionicLoading.show({
                        template: '<ion-spinner icon="ripple"></ion-spinner>'
                });

                ExpensesService.getMyExpenses().success(function (data) {
                        $scope.myExpenses = data;
                }).finally(function (data) {
                        $ionicLoading.hide();
                });

                $scope.userProfile = UserAuthService.getLoggedInUserProfile();

                $scope.doRefresh = function () {
                        ExpensesService.getMyExpenses().success(function (data) {
                                $scope.myExpenses = data;
                        }).finally(function () {
                                // Stop the ion-refresher from spinning
                                $scope.$broadcast('scroll.refreshComplete');
                        });
                };

                $scope.toggleExpense = function (expense) {
                        if ($scope.isExpenseShown(expense)) {
                                $scope.shownExpense = null;
                        } else {
                                if (expense.lineItems == "undefined" || expense.lineItems == null || expense.lineItems.length == 0) {
                                        $ionicLoading.show({
                                                template: 'Loading Line Items...'
                                        });
                                        ExpensesService.getLineItems(expense.ExpenseReportID).success(function (lineitems) {
                                                expense.lineItems = lineitems;
                                                // $scope.awaitingApproval.splice($scope.awaitingApproval.indexOf(expense), 1,expense);
                                                // $scope.$apply();
                                                $ionicLoading.hide();
                                                $scope.shownExpense = expense;
                                        })
                                } else {
                                        $scope.shownExpense = expense;
                                }
                        }
                };

                $scope.isExpenseShown = function (expense) {
                        return $scope.shownExpense === expense;
                };

                $scope.logout = function () {
                        UserAuthService.logout();
                };

                $scope.hasData =function(){
                  try{
                    return $scope.myExpenses.length > 0;
                  }catch(err){
                    return false;
                  }
                }
                 $scope.mapUserNameToPortrait = function(name){
                  return Util.mapUserNameToPortrait(name);
                };

        })
        .controller('StatusBarCtrl', function ($scope, $stateParams, $rootScope, UserAuthService, localstorage){
                $scope.userProfile = UserAuthService.getLoggedInUserProfile();

                $scope.user = localstorage.get('logged_in_user');

                $scope.logout = function () {
                        UserAuthService.logout();
                        $scope.userProfile = {};
                        $scope.user ={};
                };

                $rootScope.$on('event:auth-loginConfirmed', function () {
                  $scope.userProfile = UserAuthService.getLoggedInUserProfile();
                  $scope.user = localstorage.get('logged_in_user');
                });

        })
        .controller('AwaitingApprovalCtrl', function ($scope, $ionicScrollDelegate, ExpensesService, UserAuthService, $stateParams, $ionicLoading,$ionicPopup,Util) {
                $scope.toggleExpense = function (expense) {
                        if ($scope.isExpenseShown(expense)) {
                                $scope.shownExpense = null;
                                $scope.awaitingApproval = $scope.backupAwaitingApprovalExpenses;
                        } else {
                                if (typeof expense.lineItems === 'undefined'
                                    || expense.lineItems == null
                                    || expense.lineItems.length == 0) {
                                        $ionicLoading.show({
                                                template: 'Loading Line Items...'
                                        });
                                        ExpensesService.getLineItems(expense.ExpenseReportID).success(function (lineitems) {
                                                expense.lineItems = lineitems;
                                                // Fix up the dates of the line items for
                                                // display
                                                angular.forEach(expense.lineItems, function (item) {
                                                  item.ExpenseDate = Util.formatDate(item.ExpenseDate);
                                                });
                                                // $scope.awaitingApproval.splice($scope.awaitingApproval.indexOf(expense), 1,expense);
                                                // $scope.$apply();
                                              //  $ionicLoading.hide();
                                                $scope.shownExpense = expense;
                                                $scope.backupAwaitingApprovalExpenses = $scope.awaitingApproval;
                                                $scope.awaitingApproval = [expense];
                                        }).error(function(data){
                                          console.log('Error retrieving Expenses Line Item ' + data);
                                          alert('Error retrieving Line Items');
                                        }).finally(function (data) {
                                                $ionicLoading.hide();
                                                $ionicScrollDelegate.scrollTop();
                                        });
                                } else {
                                        $scope.shownExpense = expense;
                                        $scope.backupAwaitingApprovalExpenses = $scope.awaitingApproval;
                                        $scope.awaitingApproval = [expense];
                                        $ionicScrollDelegate.scrollTop();
                                }
                        }
                };
                $scope.isExpenseShown = function (expense) {
                        return $scope.shownExpense === expense;
                };

                $scope.hasData =function(){
                  try{
                    return $scope.awaitingApproval.length > 0;
                  }catch(err){
                    return false;
                  }
                }

                $scope.approveExpense = function (expense) {
                        $ionicLoading.show({
                                template: 'Updating Status ..'
                        });
                        ExpensesService.approve(expense).success(function (data) {
                                // Approval was sucessfully completed
                                // remove expense from list of expenses
                                // awaiting approval
                                $scope.awaitingApproval = $scope.backupAwaitingApprovalExpenses;
                                $scope.awaitingApproval.splice($scope.awaitingApproval.indexOf(expense), 1);
                        }).finally(function(){
                          $ionicLoading.hide();
                        });
                };

                $scope.declineExpense = function (expense) {
                        $ionicLoading.show({
                                template: 'Updating Status ..'
                        });
                        ExpensesService.decline(expense).success(function (data) {
                                // Decline was sucessfully completed
                                // remove expense from list of expenses
                                // awaiting approval
                                $scope.awaitingApproval = $scope.backupAwaitingApprovalExpenses;
                                $scope.awaitingApproval.splice($scope.awaitingApproval.indexOf(expense), 1);
                        }).finally(function(){
                          $ionicLoading.hide();
                        });
                };

                $scope.logout = function () {
                        UserAuthService.logout();
                };

                $scope.mapUserNameToPortrait = function(name){
                  return Util.mapUserNameToPortrait(name);
                };

                $scope.doRefresh = function () {
                        ExpensesService.getAwaitingApproval().success(function (data) {
                                if(typeof data.length =='undefined'){
                                  //Backend is not sending back an array .. set data
                                  //to be an empty array
                                  data =[];
                                }
                                $scope.awaitingApproval = data;
                                angular.forEach($scope.awaitingApproval, function (expense) {
                                  //Format the SubmissionDate for display
                                  expense.SubmissionDate=Util.formatDate(expense.SubmissionDate);
                                });

                                // // show the expense, with expense ID matching the  stateParam:id value , in expanded form
                                // // TODO ; add option to show the drilldown in a seperate Expense Report details view
                                // angular.forEach($scope.awaitingApproval, function (expense) {
                                //         expense.lineItems = [];
                                //         if (expense.ExpenseReportID == $stateParams.id) {
                                //                 $scope.toggleExpense(expense);
                                //         }
                                // })
                        }).error(function(data){
                          console.log('Error retrieving Expenses awainting Approvals: ' + data);
                          alert('Error retrieving Expenses awainting Approvals');
                        }).finally(function () {
                                // Stop the ion-refresher from spinning
                                $scope.$broadcast('scroll.refreshComplete');
                        });
                };
                $ionicLoading.show({
                        template: '<ion-spinner icon="ripple"></ion-spinner>'
                });

                $scope.userProfile = UserAuthService.getLoggedInUserProfile();
                ExpensesService.getAwaitingApproval().success(function (data) {
                        if(typeof data.length =='undefined'){
                          //Backend is not sending back an array .. set data
                          //to be an empty array
                          data =[];
                        }
                        console.log('Retrieved '+ data.length +' Approvals');
                        $scope.awaitingApproval = data;

                        // show the expense, with expense ID matching the  stateParam:id value , in expanded form
                        // TODO ; add option to show the drilldown in a seperate Expense Report details view
                        angular.forEach($scope.awaitingApproval, function (expense) {
                                //Format the SubmissionDate for display
                                expense.SubmissionDate=Util.formatDate(expense.SubmissionDate);
                                expense.lineItems = [];
                                if (typeof expense.ExpenseReportID != 'undefined' && expense.ExpenseReportID == $stateParams.id) {
                                        $scope.toggleExpense(expense);
                                }
                        });
                }).error(function(data){
                  console.log('Error retrieving Expenses awaiting Approvals: ' + data);
                  alert('Error retrieving Expenses awaiting Approvals');
                }).finally(function (data) {
                        $ionicLoading.hide();
                });
        })
        .controller('LoginController', function ($scope, $ionicModal, $timeout,
                $ionicPopover, $ionicHistory, UserAuthService, $state, $stateParams,DeviceSvc,ExpensesService) {
                // Form data for the login modal
                $scope.loginData = {};

                // Create the login modal that we will use later
                $ionicModal.fromTemplateUrl('templates/login.html', {
                        scope: $scope,
                        animation: 'slide-in'

                }).then(function (modal) {
                        $scope.modal = modal;
                });

                $scope.message = '';

                $scope.user = {
                        username: null,
                        password: null
                };

                $scope.login = function () {
                        UserAuthService.login($scope.user.username, $scope.user.password);

                };

                $scope.logout = function () {
                        UserAuthService.logout();

                };

                // Triggered in the login modal to close it
                $scope.closeLogin = function () {
                        $scope.modal.hide();
                };

                $scope.$on('event:auth-loginRequired', function (e, rejection) {
                        $scope.modal.show();
                });

                $scope.$on('event:auth-loginConfirmed', function () {
                        $scope.username = null;
                        $scope.password = null;
                        var deviceToken = DeviceSvc.all().deviceToken;
                        if ( typeof deviceToken === 'undefined'){
                              console.log("Device handshake failed..Push Notification will not function");
                        }else{
                              ExpensesService.registerWithMCSNotifications(deviceToken).success(function(data){
                                console.log("Device Enrolled with MCS Push");
                              });
                        }
                        $scope.modal.hide();
                        // The random is to force the controller to run , 
                        // avoiding caching
                        $state.transitionTo('tab.awaiting', { id: $stateParams.id,
                         random: Math.random()  }, {
                                location: true,
                                inherit: true,
                                relative: $state.$current,
                                notify: true,
                                reload: true
                        });
                });

                $scope.$on('event:auth-login-failed', function (e, status) {
                        //console.log(status);
                        var error = "Login failed.";
                        console.log(status);
                        if (status == 401) {
                                error = "Invalid Credentials ";
                        }
                        if (status == 403) {
                                error = "Access Denied";
                        }
                        $scope.message = error;

                });

        });
