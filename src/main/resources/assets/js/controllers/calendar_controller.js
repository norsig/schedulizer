Date.prototype.getMonthName = function() {
    var monthNames = [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ];
    return monthNames[this.getMonth()];
};

var MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

function computeNWeeks(firstDay) {
    var lastDay = new Date(firstDay.getTime());
    /* Get first day of the next month */
    lastDay.setDate(lastDay.getDate() + 27);
    while(lastDay.getDate() != 1) {
        lastDay.setDate(lastDay.getDate() + 1);
    }
    /* Get last sunday */
    while(lastDay.getDay() != 0) {
        lastDay.setDate(lastDay.getDate() - 1);
    }
    /* Get number of days between two dates*/
    var diff =  dateDiffInDays(firstDay, lastDay);


    return Math.ceil(diff/7.0);
}

function createMonth(day, nweeks) {
    return {
        number: day.getMonth(),
        name: day.getMonthName(),
        year: day.getFullYear(),
        nweeks: nweeks
    };
}

function createWeek(day){
    return {
        month: createMonth(day, 0),
        firstOfTheMonth: false,
        days: []
    };
}

function createMonthByFirstDay(day01) {
    var nweeks = computeNWeeks(new Date(day01.getTime()));
    return createMonth(day01, nweeks);
}

var TODAY = new Date();

function pushDayIntoWeek(week, day) {
    week.days.push({
        value: day.getDate(),
        month: day.getMonth(),
        today: day.toDateString() == TODAY.toDateString()
    });
}


App.controller('CalendarController', function ($scope) {

    var initialMonthsShown = 15;

    $scope.calendar = []; // array of week object
    $scope.firstDay = new Date();
    $scope.firstDay.setDate(1); // beginning of the month
    $scope.firstDay.setDate($scope.firstDay.getDate() - $scope.firstDay.getDay()); // sunday
    $scope.lastDay = new Date($scope.firstDay.getTime())

    var calendarCellHeight = null;

    $scope.loadPreviousMonth = function() {
        var isBeginningOfMonth = false;
        while (!isBeginningOfMonth) {
            $scope.firstDay.setDate($scope.firstDay.getDate() - 7);
            var currentWeek = createWeek($scope.firstDay);
            for (var dayCount = 0; dayCount < 7; dayCount++) {
                if($scope.firstDay.getDate() == 1) {
                    isBeginningOfMonth = true;
                    currentWeek.firstOfTheMonth = true;
                    currentWeek.month = createMonthByFirstDay($scope.firstDay);
                }
                pushDayIntoWeek(currentWeek, $scope.firstDay);
                $scope.firstDay.setDate($scope.firstDay.getDate() + 1);
            }
            $scope.calendar.unshift(currentWeek);
            $scope.firstDay.setDate($scope.firstDay.getDate() - 7);
        }
        if (calendarCellHeight === null) {
            var h = $(".week").outerHeight();
            if (h > 0) {
                // +4 from border-spacing, TODO refactor
                calendarCellHeight = h + 4;
            }
        }
        // $scope.calendar[0].month.nweeks is the number of weeks (lines) added, so
        // calendarCellHeight * it will give us the height
        return calendarCellHeight * $scope.calendar[0].month.nweeks;
    }

    $scope.loadNextMonth = function() {
        var isBeginningOfMonth = false;
        if ($scope.calendar.length > 0) {
            lastWeek = $scope.calendar[$scope.calendar.length - 1];
            lastWeek.month.name = $scope.lastDay.getMonthName();
            lastWeek.month.year = $scope.lastDay.getFullYear();
        }
        while (!isBeginningOfMonth) {
            var currentWeek = createWeek($scope.lastDay);
            for (var dayCount = 0; dayCount < 7; dayCount++) {
                if ($scope.lastDay.getDate() == 1) {
                    isBeginningOfMonth = true;
                    currentWeek.firstOfTheMonth = true;
                    currentWeek.month = createMonthByFirstDay($scope.lastDay);
                }
                pushDayIntoWeek(currentWeek, $scope.lastDay);
                $scope.lastDay.setDate($scope.lastDay.getDate() + 1);
            }
            $scope.calendar.push(currentWeek);
        }
        $scope.calendar[$scope.calendar.length - 1].month.name = "";
    }

    $scope.initCalendar = function() {
        for (var i = 1; i <= initialMonthsShown; i++) {
            if (i <= Math.ceil(initialMonthsShown / 2.0)) {
                $scope.loadNextMonth();
            } else {
                $scope.loadPreviousMonth();
            }
        }
    }

    $scope.initCalendar();

});

App.directive('calendar', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/calendar.html',
        controller: 'CalendarController'
    };
});