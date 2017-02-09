define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var SimStatistics = (function () {
        function SimStatistics(s) {
            this.vehicles_in_queue = ko.observable(0);
            this.buses_in_queue = ko.observable(0);
            this.bline_pause_time_S = ko.observable(0);
            this.absoluteTime_S = ko.observable(0);
            this.vehicles_finished = ko.observable(0);
            this.vehicles_finished_distance_M = ko.observable(0);
            this.vehicles_finished_time_S = ko.observable(0.0001);
            this.vehicles_average_Kmph = ko.computed(function () {
                if (this.vehicles_finished_time_S() === 0) {
                    return (0);
                }
                else {
                    return (this.vehicles_finished_distance_M() / 1000) / (this.vehicles_finished_time_S() / 60 / 60);
                }
            }, this);
        }
        SimStatistics.prototype.update_queue_add = function () {
            this.vehicles_in_queue(this.vehicles_in_queue() + 1);
        };
        SimStatistics.prototype.update_queue_delete = function () {
            this.vehicles_in_queue(this.vehicles_in_queue() - 1);
        };
        SimStatistics.prototype.update_vehicle_finished = function (d, s) {
            this.vehicles_finished(this.vehicles_finished() + 1);
            this.vehicles_finished_distance_M(this.vehicles_finished_distance_M() + d);
            this.vehicles_finished_time_S(this.vehicles_finished_time_S() + s);
        };
        return SimStatistics;
    }());
    exports.SimStatistics = SimStatistics;
});
//# sourceMappingURL=statistics.js.map