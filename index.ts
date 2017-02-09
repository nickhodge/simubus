// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

/// <reference path="./typings/p5.d.ts" />
/// <reference path="./typings/lib.d.ts" />
/// <reference path="./node_modules/@types/knockout/index.d.ts" />

import * as Collections from 'typescript-collections';
import * as Config from './config';
import * as Interfaces from './interfaces';
import * as Infrastructure from './infrastructure';
import * as SimStatistics from './statistics';
import * as ko from 'knockout';
import * as p5 from './libs/p5';

//declare var p5 : any;

// lanes that (will) hold vehicles
var lanes = new Collections.LinkedList<Interfaces.ILane>();
var laneconfigs = new Collections.LinkedList<Interfaces.ILaneSimConfig>();

// variables, simulation constants, factors
var config = new Config.SimConfig();

// knockout observable setup for stats
var reportStats = new SimStatistics.SimStatistics();
ko.applyBindings(reportStats);

var simubus = function (p: any) {
  p.setup = function () {
    p.frameRate(config.frameRate_Ps);
    var i = 0;
    //laneconfigs.add(new Simubus.LaneSimConfig(0, 0, 0, 0, config));
    //lanes[0].queued_vehicles.add(new Simubus.SmallBus(0, this.yStart_M, 0, 50, this.config, this));

    //laneconfigs[0] = new Simubus.LaneSimConfig(0,0,0,0,config);

    laneconfigs.add(new Config.LaneSimConfig(200, 50, 20, 400, config));
    laneconfigs.add(new Config.LaneSimConfig(50, 10, 0, 2400, config));
    laneconfigs.add(new Config.LaneSimConfig(0, 0, 0, 2400, config));
    var i = 0;

    laneconfigs.forEach(c => {
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
    lanes.forEach(l => {
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
//myp5();