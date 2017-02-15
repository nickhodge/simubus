define(["require", "exports", "knockout", "./vehicles"], function (require, exports, ko, Vehicles) {
    "use strict";
    var LaneStatistics = (function () {
        function LaneStatistics(s) {
            this.bline_queued_time_S = 0;
            this.bline_buses_total = 0;
            this.queued_vehicles = 0;
            this.queued_buses = 0;
        }
        return LaneStatistics;
    }());
    exports.LaneStatistics = LaneStatistics;
    var SimStatistics = (function () {
        function SimStatistics(s) {
            this.vehicles_in_queue = ko.observable(0);
            this.buses_in_queue = ko.observable(0);
            this.cumulative_bline_queued_time_S = ko.observable(0);
            this.cumulative_bline_finished = ko.observable(0);
            this.avg_bline_queued_time_S = ko.computed(function () {
                if (this.cumulative_bline_queued_time_S() === 0) {
                    return (0);
                }
                else {
                    return (this.cumulative_bline_queued_time_S()) / (this.cumulative_bline_finished());
                }
            }, this);
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
            this.vehicles_finish_pH = ko.computed(function () {
                if (this.absoluteTime_S() === 0) {
                    return (0);
                }
                else {
                    return (this.vehicles_finished()) / (this.absoluteTime_S() / 60 / 60);
                }
            }, this);
        }
        SimStatistics.prototype.update_vehicle_finished = function (v) {
            this.vehicles_finished(this.vehicles_finished() + 1);
            this.vehicles_finished_distance_M(this.vehicles_finished_distance_M() + v.deltaD_M);
            this.vehicles_finished_time_S(this.vehicles_finished_time_S() + v.deltaT_S);
            if (v instanceof Vehicles.BLineBus) {
                this.cumulative_bline_finished(this.cumulative_bline_finished() + 1);
                this.cumulative_bline_queued_time_S(this.cumulative_bline_queued_time_S() + v.queued_time_S);
            }
        };
        return SimStatistics;
    }());
    exports.SimStatistics = SimStatistics;
});
//# sourceMappingURL=statistics.js.map