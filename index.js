define(["require", "exports", "typescript-collections", "./config", "./infrastructure", "./statistics", "knockout", "./libs/p5"], function (require, exports, Collections, Config, Infrastructure, SimStatistics, ko, p5) {
    "use strict";
    var lanes = new Collections.LinkedList();
    var laneconfigs = new Collections.LinkedList();
    var config = new Config.SimConfig();
    var reportStats = new SimStatistics.SimStatistics();
    ko.applyBindings(reportStats);
    var simubus = function (p) {
        p.setup = function () {
            p.frameRate(config.frameRate_Ps);
            var i = 0;
            laneconfigs.add(new Config.LaneSimConfig(200, 50, 20, 400, config));
            laneconfigs.add(new Config.LaneSimConfig(50, 10, 0, 2400, config));
            laneconfigs.add(new Config.LaneSimConfig(0, 0, 0, 2400, config));
            var i = 0;
            laneconfigs.forEach(function (c) {
                i++;
                lanes.add(new Infrastructure.Lane(i, 0, 300, config, c, reportStats));
            });
            p.createCanvas(config.pixelWidth_P, config.pixelHeight_P);
        };
        p.draw = function () {
            config.absoluteTime_s += config.simFrameRate_Ps;
            reportStats.absoluteTime_S(config.absoluteTime_s);
            p.background(200);
            var globalLaneStats = new Infrastructure.LaneStatistics();
            lanes.forEach(function (l) {
                var r = l.update();
                globalLaneStats.bline_pause_time += r.bline_pause_time;
                globalLaneStats.queued_vehicles += r.queued_vehicles;
                globalLaneStats.queued_buses += r.queued_buses;
                l.draw(p);
            });
            reportStats.bline_pause_time_S(globalLaneStats.bline_pause_time);
            reportStats.vehicles_in_queue(globalLaneStats.queued_vehicles);
            reportStats.buses_in_queue(globalLaneStats.queued_buses);
        };
    };
    var myp5 = new p5(simubus);
});
//# sourceMappingURL=index.js.map