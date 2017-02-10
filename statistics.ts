// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Collections from 'typescript-collections';
import * as ko from 'knockout';
import * as Interfaces from './interfaces';

export class SimStatistics implements Interfaces.ISimStatistics {
    vehicles_in_queue : KnockoutObservable<number>;
    buses_in_queue : KnockoutObservable<number>;
    vehicles_average_Kmph : KnockoutObservable<number>;
    bline_pause_time_S : KnockoutObservable<number>;
    absoluteTime_S : KnockoutObservable<number>;
    vehicles_finished : KnockoutObservable<number>;
    vehicles_finished_distance_M : KnockoutObservable<number>;
    vehicles_finished_time_S : KnockoutObservable<number>;
    vehicles_finish_pH : KnockoutObservable<number>;
    
    constructor(s?:any) {
        this.vehicles_in_queue = ko.observable(0);
        this.buses_in_queue = ko.observable(0);
        this.bline_pause_time_S = ko.observable(0);
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

    update_vehicle_finished(d: number, s : number) : void {
        this.vehicles_finished(this.vehicles_finished() + 1);
        this.vehicles_finished_distance_M(this.vehicles_finished_distance_M() + d);
        this.vehicles_finished_time_S(this.vehicles_finished_time_S() + s);
    }
}