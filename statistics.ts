// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Collections from 'typescript-collections';
import * as ko from 'knockout';
import * as Interfaces from './interfaces';
import * as Vehicles from './vehicles';


export class LaneStatistics implements Interfaces.ILaneStatistics {
  bline_queued_time_S: number;
  queued_vehicles: number;
  queued_buses: number;
  bline_buses_total: number;
  constructor(s?: any) {
    this.bline_queued_time_S = 0;
    this.bline_buses_total = 0;
    this.queued_vehicles = 0;
    this.queued_buses = 0;
  }
}

export class SimStatistics implements Interfaces.ISimStatistics {
    vehicles_in_queue : KnockoutObservable<number>;
    buses_in_queue : KnockoutObservable<number>;
    vehicles_average_Kmph : KnockoutObservable<number>;
    avg_bline_queued_time_S : KnockoutObservable<number>;
    cumulative_bline_queued_time_S : KnockoutObservable<number>;
    cumulative_bline_finished : KnockoutObservable<number>;
    absoluteTime_S : KnockoutObservable<number>;
    vehicles_finished : KnockoutObservable<number>;
    vehicles_finished_distance_M : KnockoutObservable<number>;
    vehicles_finished_time_S : KnockoutObservable<number>;
    vehicles_finish_pH : KnockoutObservable<number>;
    
    constructor(s?:any) {
        this.vehicles_in_queue = ko.observable(0);
        this.buses_in_queue = ko.observable(0);
        this.cumulative_bline_queued_time_S = ko.observable(0);
        this.cumulative_bline_finished = ko.observable(0);
        this.avg_bline_queued_time_S = ko.computed(function() {
            if (this.cumulative_bline_queued_time_S() === 0) {return (0);} else { 
            return (this.cumulative_bline_queued_time_S() )/ (this.cumulative_bline_finished());
            }}, this);
        this.absoluteTime_S = ko.observable(0);
        this.vehicles_finished = ko.observable(0);
        this.vehicles_finished_distance_M = ko.observable(0);
        this.vehicles_finished_time_S = ko.observable(0.0001);
        this.vehicles_average_Kmph = ko.computed(function() {
            if (this.vehicles_finished_time_S() === 0) {return (0);} else { 
            return (this.vehicles_finished_distance_M() / 1000 )/ (this.vehicles_finished_time_S() / 60 / 60);
        }}, this);
        this.vehicles_finish_pH = ko.computed(function() {
            if (this.absoluteTime_S() === 0) {return (0);} else { 
            return (this.vehicles_finished() )/ (this.absoluteTime_S() / 60 / 60);
            }}, this);
    }

    update_vehicle_finished(v: Interfaces.IVehicle) : void {
        this.vehicles_finished(this.vehicles_finished() + 1);
        this.vehicles_finished_distance_M(this.vehicles_finished_distance_M() + v.deltaD_M);
        this.vehicles_finished_time_S(this.vehicles_finished_time_S() + v.deltaT_S);

        if (v instanceof Vehicles.BLineBus) {
            this.cumulative_bline_finished(this.cumulative_bline_finished() + 1);
            this.cumulative_bline_queued_time_S(this.cumulative_bline_queued_time_S() + v.queued_time_S);
        }
    }
}