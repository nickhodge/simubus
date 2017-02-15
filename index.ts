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
import * as Vehicles from "./vehicles";
import * as Statistics from './statistics';
import * as Stops from './stops';
import * as ko from 'knockout';
import * as p5 from './libs/p5';

// big ole debug switch
var debug = false;

// lanes that (will) hold vehicles
var lanes = new Collections.LinkedList<Interfaces.ILane>();
var laneconfigs = new Collections.LinkedList<Interfaces.ILaneSimConfig>();

// variables, simulation constants, factors
var config = new Config.SimConfig();

// knockout observable setup for stats
var reportStats = new Statistics.SimStatistics();
ko.applyBindings(reportStats);

var simubus = function (p: any) {
  p.setup = function () {
    p.frameRate(config.frameRate_Ps);
    var i = 0;

    if (!debug) {
      laneconfigs.add(new Config.LaneSimConfig(300, 30, 20, 20, 40, config));
      laneconfigs.add(new Config.LaneSimConfig(50, 30, 0, 0, 1300, config));
      laneconfigs.add(new Config.LaneSimConfig(0, 0, 0, 0, 1300, config));

      laneconfigs.forEach(c => {
        i++;
        lanes.add(new Infrastructure.Lane(i, 0, 300, config, c, reportStats));
     });
    
     lanes.elementAtIndex(0).stops.add(new Stops.BusStop(110, 30, config, lanes.elementAtIndex(0) as Interfaces.IRoadThing));
     lanes.elementAtIndex(0).stops.add(new Stops.TrafficStop(0, 60, 40, 50, config, lanes.elementAtIndex(0) as Interfaces.IRoadThing));
     lanes.elementAtIndex(1).stops.add(new Stops.TrafficStop(0, 60, 40, 50, config, lanes.elementAtIndex(1) as Interfaces.IRoadThing));
     lanes.elementAtIndex(2).stops.add(new Stops.TrafficStop(0, 60, 40, 50, config, lanes.elementAtIndex(2) as Interfaces.IRoadThing));
    

} else {
      laneconfigs.add(new Config.LaneSimConfig(0, 0, 0, 0, 0, config));

      laneconfigs.forEach(c => {
        i++;
        lanes.add(new Infrastructure.Lane(i, 0, 300, config, c, reportStats));
      });

      lanes.elementAtIndex(0).queued_vehicles.add(new Vehicles.M30Bus(0, 0, 0, 50, config, lanes.elementAtIndex(0)));
      lanes.elementAtIndex(0).queued_vehicles.add(new Vehicles.Car(0, 0, 0, 60, config, lanes.elementAtIndex(0)));
      lanes.elementAtIndex(0).queued_vehicles.add(new Vehicles.SmallBus(0, 0, 0, 50, config, lanes.elementAtIndex(0)));
      lanes.elementAtIndex(0).queued_vehicles.add(new Vehicles.Car(0, 0, 0, 60, config, lanes.elementAtIndex(0)));
      lanes.elementAtIndex(0).queued_vehicles.add(new Vehicles.SmallBus(0, 0, 0, 50, config, lanes.elementAtIndex(0)));
    }
    p.createCanvas(config.pixelWidth_P, config.pixelHeight_P);
  };

  p.draw = function () {
    config.absoluteTime_s += config.simFrameRate_Ps;
    reportStats.absoluteTime_S(config.absoluteTime_s);
    p.background(200);
    var globalLaneStats = new Statistics.LaneStatistics();
    lanes.forEach(l => {
      var r = l.update(lanes);
      globalLaneStats.queued_vehicles += r.queued_vehicles;
      globalLaneStats.queued_buses += r.queued_buses;
      l.draw(p);
    });
    reportStats.vehicles_in_queue(globalLaneStats.queued_vehicles);
    reportStats.buses_in_queue(globalLaneStats.queued_buses);
  };
};

var myp5 = new p5(simubus);
//myp5();