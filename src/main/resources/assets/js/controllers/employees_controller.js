App.controller('EmployeesController', function($scope, $timeout, yammer, DomUtils, GroupEmployee, EMPTY_GROUP) {
        function getGroupEmployeesData(group) {
            if (group == EMPTY_GROUP) {
                group.employees = [];
                return;
            }
            group.employees = GroupEmployee.query({group_id: group.id}, function(employees) {
                group.employeeMap = _.indexBy(employees, 'id');
            });
        }

        function addEmployee(yEmployee) {
            var group = $scope.selectedGroup;
            var yid = yEmployee.id;
            if (yid == undefined || yid == "") {
                return false;
            }
            if (_.find(group.employees, function(e){ return e.yammerId == yid; })) {
                $scope.newEmployeeName = "";
                return false;
            }

            var employee = new GroupEmployee({groupId: group.id});
            employee.yammerId = yid;
            employee.name = yEmployee.full_name;
            employee.imageUrlTemplate = yEmployee.photo;
            employee.$save({}, function(response) {
                group.addEmployee(employee);
                $scope.newEmployeeName = "";
            });
            return true;

        }

        $scope.deleteEmployee = function (employee) {
            var group = $scope.selectedGroup;
            group.employees = _.without(group.employees, _.findWhere(group.employees, employee));
            employee.groupId = group.id;
            employee.$delete();
        }


        $scope.autocompleteList = [];

        var timeout;
        var AUTOCOMPLETE_QUERY_WAIT_TIME = 300; // as suggested by yammers api
        $scope.$watch('newEmployeeName', function(prefix) {
            if (prefix == undefined || prefix == "" || $scope.newEmployee != undefined) {
                return;
            }
            if (timeout != undefined) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(function() {
                yammer.autocomplete(prefix, function(response) {
                    if (response == undefined) {
                        return;
                    }
                    var users = response.user;
                    $timeout(function(){
                        $scope.autocompleteList =
                            (users.map(function(user) {
                                var names = user.full_name.split(" ");
                                user.label = names[0] + " " + names[names.length - 1];
                                return {
                                    label: user.label,
                                    value: user
                                }
                            }));
                        $scope.autocompleteList = _.unique($scope.autocompleteList, function(e) { return e.label; } );
                    });
                });

            }, AUTOCOMPLETE_QUERY_WAIT_TIME);
        });

        $scope.getAutocompleteItem = function(user) {
            return "" +
                "<div class=\"employee-image\"><img src=\"" + user.photo + "\"/></div>" +
                "<div class=\"employee-name\">" + user.label + "</div>";
        }

        $scope.employeeInput = null; // <input/>

        $scope.triggerAddEmployee = function() {
            if ($scope.newEmployee) {
                addEmployee($scope.newEmployee);
                $scope.newEmployee = undefined;
            } else {
                DomUtils.shakeOnError($scope.employeeInput);
            }
        }

        $scope.userInputKeyDown = function(e) {
            $scope.newEmployee = undefined;
        }

        $scope.userInputEnter = function(e) {
            $scope.triggerAddEmployee();
        }

        $scope.onSelectAutocomplete = function(user) {
            $scope.newEmployee = user;
            $scope.newEmployeeName = user.label;
        }

        $scope.$watch('selectedGroup', function() {
            if ($scope.selectedGroup == undefined) { return; }
            getGroupEmployeesData($scope.selectedGroup);
        });

});