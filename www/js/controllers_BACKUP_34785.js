angular.module('starter.controllers', [])
        .controller('MyReportCtrl', function ($scope, ExpensesService, UserAuthService, $ionicLoading) {
                ExpensesService.getMyExpenses().success(function (data) {
                        $scope.myExpenses = data;
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
        })
        .controller('StatusBarCtrl', function ($scope, $stateParams, UserAuthService, localstorage) {
                $scope.userProfile = UserAuthService.getLoggedInUserProfile();

                $scope.user = localstorage.get('logged_in_user');

                $scope.logout = function () {
                        UserAuthService.logout();
                };

        })
//   .controller('ApprovalDetailCtrl', function ($scope, $stateParams,UserAuthService, localstorage) {
//         $scope.userProfile = UserAuthService.getLoggedInUserProfile();
                
//         $scope.user= localstorage.get('logged_in_user');
                
//         $scope.logout = function(){
//                 UserAuthService.logout();
//         };

// })
        .controller('AwaitingApprovalCtrl', function ($scope, ExpensesService, UserAuthService, $stateParams, $ionicLoading) {



                $scope.toggleExpense = function (expense) {
                        if ($scope.isExpenseShown(expense)) {
                                $scope.shownExpense = null;
                                $scope.awaitingApproval = $scope.backupAwaitingApprovalExpenses;
                        } else {

                                if (expense.lineItems === undefined || expense.lineItems == null || expense.lineItems.length == 0) {
                                        $ionicLoading.show({
                                                template: 'Loading Line Items...'
                                        });
                                        ExpensesService.getLineItems(expense.ExpenseReportID).success(function (lineitems) {
                                                expense.lineItems = lineitems;
                                                // $scope.awaitingApproval.splice($scope.awaitingApproval.indexOf(expense), 1,expense);
                                                // $scope.$apply();
                                                $ionicLoading.hide();
                                                $scope.shownExpense = expense;
                                                $scope.backupAwaitingApprovalExpenses = $scope.awaitingApproval;
                                                $scope.awaitingApproval = [expense];
                                        })
                                } else {
                                        $scope.shownExpense = expense;
                                        $scope.backupAwaitingApprovalExpenses = $scope.awaitingApproval;
                                        $scope.awaitingApproval = [expense];
                                }

                        }
                };
                $scope.isExpenseShown = function (expense) {


                        return $scope.shownExpense === expense;
                };

                $scope.approveExpense = function (expense) {
                        ExpensesService.approve(expense).success(function (data) {
                                // Approval was sucessfully completed 
                                // remove expense from list of expenses
                                // awaiting approval
                                $scope.awaitingApproval = $scope.backupAwaitingApprovalExpenses;
                                $scope.awaitingApproval.splice($scope.awaitingApproval.indexOf(expense), 1);
                        });
                };
                
                $scope.declineExpense = function (expense) {
                        ExpensesService.decline(expense).success(function (data) {
                                // Decline was sucessfully completed 
                                // remove expense from list of expenses
                                // awaiting approval
                                $scope.awaitingApproval = $scope.backupAwaitingApprovalExpenses;
                                $scope.awaitingApproval.splice($scope.awaitingApproval.indexOf(expense), 1);
                        });
                };

                $scope.logout = function () {
                        UserAuthService.logout();
                };

                $scope.userProfile = UserAuthService.getLoggedInUserProfile();

                $scope.doRefresh = function () {
                        ExpensesService.getAwaitingApproval().success(function (data) {

                                $scope.awaitingApproval = data;
                       
                                // show the expense, with expense ID matching the  stateParam:id value , in expanded form  
                                // TODO ; add option to show the drilldown in a seperate Expense Report details view
                                angular.forEach($scope.awaitingApproval, function (expense) {
                                        expense.lineItems = [];
                                        if (expense.ExpenseReportID == $stateParams.id) {
                                                $scope.toggleExpense(expense);
                                        }
                                })
                        }).finally(function () {
                                // Stop the ion-refresher from spinning
                                $scope.$broadcast('scroll.refreshComplete');
                        });
                };
                ExpensesService.getAwaitingApproval().success(function (data) {

                        $scope.awaitingApproval = data;
                       
                        // show the expense, with expense ID matching the  stateParam:id value , in expanded form  
                        // TODO ; add option to show the drilldown in a seperate Expense Report details view
                        angular.forEach($scope.awaitingApproval, function (expense) {
                                expense.lineItems = [];
                                if (expense.ExpenseReportID == $stateParams.id) {
                                        $scope.toggleExpense(expense);
                                }
                        });
                });

        })
        .controller('LoginController', function ($scope, $ionicModal, $timeout,
                $ionicPopover, $ionicHistory, UserAuthService, $state) {
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
                        $scope.modal.hide();
                        $state.transitionTo('tab.awaiting', { id: $scope.user.username }, {
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
        }])
;
