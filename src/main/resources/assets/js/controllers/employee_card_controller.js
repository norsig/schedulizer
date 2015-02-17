App.controller('EmployeeCardController', function ($scope, $rootScope) {

    $scope.isGroupAdmin = $rootScope.isGroupAdmin;
    $scope.isGroupMember = $rootScope.isGroupMember;
    $scope.isGroupMemberOrGlobalAdmin = $rootScope.isGroupMemberOrGlobalAdmin;
    $scope.isGlobalAdmin = $rootScope.isGlobalAdmin;

    $scope.toggleAdminClicked = function(employee) {
        if (!$scope.isGroupAdmin($scope.group)) {
            return;
        }
        if(employee.globalAdmin) { return; }
        $scope.toggleAdmin(employee);
    }

});

App.directive('employeeCard', function() {
    return {
        restrict: 'E',
        scope: {
            employee: "=",
            group: "=",
            remove: "&",
            toggleAdmin: "="
        },
        templateUrl: 'views/employee_card.html',
        controller: 'EmployeeCardController'
    };
});