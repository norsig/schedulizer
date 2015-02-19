App.controller('EmployeesController', function($scope, $timeout, $dialogs, $rootScope, yammer, Session, AuthService,
                                               Utils, GroupEmployee, AssignmentStats, AdminsResource, EMPTY_GROUP) {

        function getGroupEmployeesData(group) {
            if (group == EMPTY_GROUP || group == null) {
                group.employees = [];
                return;
            }
            group.employees = GroupEmployee.query({group_id: group.id}, function(response) {
                group.employeeMap = _.indexBy(group.employees, 'id');
            });
        }

        function addEmployee(yEmployee) {
            var group = $scope.selectedGroup;
            var yid = yEmployee.id;
            if (yid == undefined || yid == "") {
                return false;
            }
            if (_.find(group.employees, function(e){ return e.yammerId == yid; })) {
                $scope.employeeInput.setValue("");
                return false;
            }

            var employee = new GroupEmployee({groupId: group.id});
            employee.yammerId = yid;
            employee.name = yEmployee.full_name;
            employee.imageUrlTemplate = yEmployee.photo;
            employee.$save({}, function(response) {
                group.addEmployee(employee);
                $scope.employeeInput.setValue("");
            });
            return true;

        }

        $scope.deleteEmployee = function(employee) {
            var confirm = $dialogs.confirm('Please confirm',
                                           'Are you sure you want to remove this employee from this group? <br>');
            confirm.result.then(function(btn) {
                var group = $scope.selectedGroup;
                employee.groupId = group.id;
                employee.$delete().then(function() {
                    group.employees = _.without(group.employees, _.findWhere(group.employees, employee));
                });
            });
        };


        $scope.stat = {
            range: {
                from: Date.TODAY.plusWeeks(-3 * 12),
                to: Date.TODAY
            }
        };

        var MINIMUM_DAYS_SELECTED_TO_EDIT_MODE = 2;

        $scope.isStatEditMode = function() {
            var days = $scope.selectedDays;
            return days && Date.isRange(days) && days.length >= MINIMUM_DAYS_SELECTED_TO_EDIT_MODE;
        };

        $scope.getStatEditHintAttr = function() {
            return $scope.isStatEditMode()
                ?  undefined // Hides the attribute
                : "First selected a RANGE of days on the calendar then press this button.";
        };

        $scope.setStatRangeIfEditMode = function() {
            if (!$scope.isStatEditMode()) return;

            var r = $scope.selectedDays.maxMinBy(Date.SORT_BY);
            $scope.stat.range.from = r.min;
            $scope.stat.range.to = r.max;
            $scope.getAssignmentStats();
        };

        $scope.getAssignmentStats = function() {
            var group = $scope.selectedGroup;
            if (group == EMPTY_GROUP || group == null) {
                return;
            }

            AssignmentStats.query({
                group_id: group.id,
                start_date: $scope.stat.range.from.toISOLocalDateString(),
                end_date: $scope.stat.range.to.toISOLocalDateString()
            }, function(assignmentStats) {
                _.each(group.employees, function(e) {
                    e.statistics = {};
                    if (!assignmentStats[e.id]) return;
                    e.statistics = _.chain(assignmentStats[e.id])
                        .each(function(s) {s.assignmentType = group.assignmentTypeFor(s.assignmentTypeId);})
                        .indexBy('assignmentTypeId')
                        .value();
                });
                // complete with "count: 0" for other assignment types
                _.each(group.employees, function(e) {
                    _.each(group.assignmentTypes, function(a) {
                        if (e.statisticsFor(a.id)) return;
                        e.statistics[a.id] = {
                            assignmentTypeId: a.id,
                            assignmentType: a,
                            count: 0
                        };
                    });
                });
            });
        }

        $scope.$watch('assignmentsChange', $scope.getAssignmentStats);

        $scope.getAssignmentTypeHeaderStyle = function(assignmentType) {
            var ids = _.map($scope.employeeOrder, Math.abs);
            var i = _.indexOf(ids, assignmentType.id);
            var n = _.size(ids);
            var current = n - i - 1;
            var srcScale = [0, n - 1];

            return {
                position: 'relative',
                opacity: Utils.interpolate(current, srcScale, [0.25, 0.9]),
                paddingTop: Utils.interpolate(current, srcScale, [2, 8]) + 'px'
            };
        };

        $scope.employeeOrder = []
        $scope.employeeOrderKey = []

        function computeEmployeeOrderKey(employeeOrder) {
            return _.map(employeeOrder, function(id) {
                var prefix = (id < 0) ? '-' : '+';
                return prefix + 'statistics[' + Math.abs(id) + '].count';
            })
        }

        function getOrderedId(assignmentType) {
            return (assignmentType.desc) ? -assignmentType.id : +assignmentType.id;
        }

        function tryUpdateOrder(newOrder) {
            if (_.isEqual(newOrder, $scope.employeeOrder)) return;
            $scope.employeeOrder = newOrder;
            $scope.employeeOrderKey = computeEmployeeOrderKey(newOrder);
        }

        function tryComputeEmployeeOrder() {
            if ($scope.selectedGroup == null || $scope.selectedGroup == EMPTY_GROUP) return;
            var assignmentTypes = $scope.selectedGroup.assignmentTypes;
            if (assignmentTypes == null || assignmentTypes.length <= 0) return;
            var map = _.indexBy(assignmentTypes, 'id');
            var newIds = _.map(assignmentTypes, 'id');
            var currentIds = _.map($scope.employeeOrder, Math.abs);
            var newOrder = _.chain(currentIds)       // [unorderedId]
                .union(newIds)                       // [unorderedId]
                .intersection(newIds)                // intersect() after union() to keep original order
                .map(function(id) {return map[id];}) // [assignmentType]
                .map(getOrderedId)                   // [orderedId]
                .value();

            tryUpdateOrder(newOrder);
        }

        $scope.$watch('assignmentsChange', tryComputeEmployeeOrder);

        $scope.updateEmployeesOrder = function(assignmentType) {
            var oldId = getOrderedId(assignmentType);
            assignmentType.desc = !assignmentType.desc;
            var newId = getOrderedId(assignmentType);

            var newOrder = _.chain($scope.employeeOrder)
                .without(oldId)
                .unshift(newId)
                .value();

            tryUpdateOrder(newOrder);
        }

        $scope.employeeInput = {}; // <input/>

        $scope.triggerAddEmployee = function() {
            if ($scope.newEmployee) {
                addEmployee($scope.newEmployee);
                $scope.newEmployee = undefined;
            } else {
                $scope.employeeInput.shake();
            }
        }

        $scope.userInputKeyDown = function() {
            $scope.newEmployee = undefined;
        }

        $scope.userInputEnter = function() {
            $scope.triggerAddEmployee();
        }

        $scope.onSelectAutocomplete = function(user) {
            $scope.newEmployee = user;
        }

        $scope.toggleAdmin = function(employee) {
            if (employee.groupAdmin) {
                $scope.deleteAdmin(employee);
            } else {
                $scope.addAdmin(employee);
            }
        }

        $scope.addAdmin = function(employee) {
            var confirm = $dialogs.confirm('Please confirm',
                                           'Are you sure you want to make this user an admin? <br>' +
                                           'He will be able to edit this group as much as he wants');
            confirm.result.then(function(btn){
                var groupId = $scope.selectedGroup.id;
                AdminsResource.save({groupId: groupId, employeeId: employee.id}, function() {
                    employee.groupAdmin = true;
                    if (employee.id == Session.userId && !Session.groupsAdmin.contains(groupId)) {
                        Session.groupAdmin.push(groupId);
                    }
                });
            });
        }

        $scope.deleteAdmin = function(employee) {
            var confirm;
            if (employee.id == Session.userId) {
                confirm = $dialogs.confirm('Please confirm',
                                           'Are you sure you want to revoke your own admin privileges? <br>' +
                                           'YOU WILL LOSE POWER!');
            } else {
                confirm = $dialogs.confirm('Please confirm',
                                           'Are you sure you want to revoke admin privileges from this user? <br>');
            }
            confirm.result.then(function(btn){
                AdminsResource.delete({group_id: $scope.selectedGroup.id, employee_id: employee.id}, function() {
                    employee.groupAdmin = false;
                    if (employee.id == Session.userId) {
                        AuthService.removeGroupAdminPrivileges($scope.selectedGroup.id);
                    }
                });
            });
        }

        $scope.$watch('selectedGroup', function() {
            if ($scope.selectedGroup == null || $scope.selectedGroup == EMPTY_GROUP) return;
            getGroupEmployeesData($scope.selectedGroup);
            $scope.getAssignmentStats();
        });

        // Create new property to centralize assignments change events
        $scope.assignmentsChange = 0;

        function touchAssignments() {
            if ($scope.selectedGroup == null || $scope.selectedGroup == EMPTY_GROUP) return;
            $scope.assignmentsChange++;
        }

        $rootScope.$on("global-admins-changed", function() {
            getGroupEmployeesData($scope.selectedGroup);
        });

        var debouncedTouchAssignments = Utils.lastOfBurst(touchAssignments, 150);
        $scope.$watch('selectedGroup.employees.length', debouncedTouchAssignments);
        $scope.$watch('selectedGroup.assignmentTypes.length', debouncedTouchAssignments);
        $scope.$watch('assignmentTypeBuckets', debouncedTouchAssignments, true);
});
