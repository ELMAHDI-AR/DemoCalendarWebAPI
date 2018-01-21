var app = angular.module('myApp', ['ui.calendar','ui.bootstrap']);
app.controller('myNgController', ['$scope', '$http', 'uiCalendarConfig', '$uibModal', function ($scope, $http, uiCalendarConfig, $uibModal) {

    $scope.SelectedEvent = null;
    var isFirstTime = true;

    $scope.events = [];
    $scope.eventSources = [$scope.events];

    $scope.NewEvent = {};

    // this function for get datetime from json date.
    function getDate(datetime) {

        if (datetime != null)
        {
            var mili = datetime.replace('/\/Date\((-?\d+)\)\//', '$1');
            return new Date(parseInt(mili));
        } else {
            return "";
        }
    }

    // this function for clear calendar events.
    function clearCalendar() {
        if (uiCalendarConfig.calendars.myCalendar != null) {
            uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEvents');
            uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
        }
    }


    //load Events From Server
    function populate() {
        clearCalendar();

        $http.get('/api/Calendar', {
            cache: false,
            params: {},
        }).then(function (response) {
            
            $scope.events.slice(0, $scope.events.length);

            console.log("------ Get Events -------");
            console.log(response);

            angular.forEach(response.data, function (value) {

                $scope.events.push({
                    id: value.EventID, 
                    title: value.EventTitle,
                    description: value.EventDescription,
                    start: new Date(parseInt(value.StartDate.substr(6))),
                    end: new Date(parseInt(value.EndDate.substr(6))),
                });

                console.log($scope.events);

            });
        });
    }

    populate();


    //Configure Calendar
    $scope.uiConfig = {
        calendar: {
            height: 450,
            editable: true,
            displayEventTime: true,
            header: {
                left: 'month basicWeek basic day agendaWeek agendaDay',
                center: 'title',
                right: 'today prev, next'
            },
            timeFormat: {
                month: '',
                agenda: 'h:mm:t'
            },
            selectable: true,
            selectHelper: true,
            select: function (start, end) {
                var fromDate = moment(start).format('YYYY/MM/DD LT');
                var endDate = moment(end).format('YYYY/MM/DD LT');

                $scope.NewEvent = {
                    EventID: 0,
                    StartAt: fromDate,
                    EndAt: endDate,
                    IsFullDay: false,
                    Title: '',
                    Description: ''
                }

                $scope.ShowModal();

            },
            eventClick: function (event)
            {
                $scope.SelectedEvent = event;

                var fromDate = moment(event.start).format('YYYY/MM/DD LT');
                var endDate = moment(event.end).format('YYYY/MM/DD LT');

                $scope.NewEvent = {
                    EventID: event.id,
                    StartDate: fromDate,
                    EndDate: endDate,
                    IsFullDay: false,
                    EventTitle: event.title,
                    EventDescription: event.description
                }
                console.log(event);
                $scope.ShowModal();
            },
            eventAfterallRender: function () {
                if ($scope.events.length > 0 && isFirstTime) {
                    //Focus FirstEvent
                    uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start);
                    isFirstTime = false;
                }
            }
        }

    };

    // this functionfor show modal dialog
    $scope.ShowModal = function () {

        $scope.option = {
            templateUrl: 'modalContent.html',
            controller: 'modalController',
            backdrop: 'static',
            resolve: {
                NewEvent: function () {
                    return $scope.NewEvent;
                }
            }
        };

        var modal = $uibModal.open($scope.option);
        modal.result.then(function (data) {

            switch (data.operation) {
                case 'Save':
                    //Save here
                    $http({
                        method: 'POST',
                        url: '/api/Calendar',
                        data: $scope.NewEvent
                    }).then(function (response) {
                        if (response.data.status) {
                            populate();
                        }
                        })
                    break;
                case 'Delete':
                    //Delete here

                    $http({
                        method: 'POST',
                        url: '/api/Calendar',
                        data: { 'eventId': $scope.NewEvent.EventID }
                    }).then(function (response) {
                        if (response.data.status) {
                            populate();
                        }
                    })


                    break;

                default:
                    break;
            }

        }, function () {
            console.log('Modal dialog closed');
        })

    }


}])


//create a new controller for modal
app.controller('modalController', ['$scope', '$uibModalInstance', 'NewEvent', function ($scope, $uibModalInstance, NewEvent) {

    $scope.NewEvent = NewEvent;
    $scope.Message = "";

    $scope.ok = function () {

        if ($scope.NewEvent.Title.trim() != "") {
            $uibModalInstance.close({ event: $scope.NewEvent, operation: 'Save' });
        } else {
            $scope.Message = "Event title required !";
        }

    }

    $scope.delete = function () {
        $uibModalInstance.close({ event: $scope.NewEvent, operation: 'Delete' });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

}])