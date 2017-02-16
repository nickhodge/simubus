define(["require", "exports", "typescript-collections", "./vehicles", "./interfaces", "./stops", "./statistics"], function (require, exports, Collections, Vehicles, Interfaces, Stops, Statistics) {
    "use strict";
    var Lane = (function () {
        function Lane(_num, _xStart_M, _xEnd_M, _config, _laneconfig, _simstatistics) {
            this.config = _config;
            this.laneconfig = _laneconfig;
            this.sim_statistics = _simstatistics;
            this.num = _num;
            this.xStart_M = _xStart_M;
            this.xEnd_M = _xEnd_M;
            this.width_M = 4;
            this.yStart_M = (this.num * this.width_M) + (this.width_M / 2);
            this.yEnd_M = this.yStart_M;
            this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
            this.pixelStartY = this.yStart_M * this.config.simScale_PpM;
            this.pixelEndX = this.xEnd_M * this.config.simScale_PpM;
            this.pixelEndY = this.yEnd_M * this.config.simScale_PpM;
            this.length_M = this.xEnd_M - this.xStart_M;
            this.vehicles = new Collections.LinkedList();
            this.queued_vehicles = new Collections.LinkedList();
            this.stops = new Collections.LinkedList();
            this.laneconfig.start();
        }
        Lane.prototype.front_of = function () {
            return (this.xEnd_M);
        };
        Lane.prototype.end_of = function () {
            return (this.xEnd_M);
        };
        Lane.prototype.rear_of = function () {
            return (this.xStart_M);
        };
        Lane.prototype.update = function (lanes) {
            var _this = this;
            var response = new Statistics.LaneStatistics();
            this.stops.forEach(function (s) {
                if (s.update()) {
                    _this.vehicles.forEach(function (v) {
                        if (s.near_vehicle(v)) {
                            if (!s.stopping) {
                                v.stopCountdown_S = 0;
                                v.currentState = Interfaces.VehicleMovementState.accelerating;
                            }
                        }
                    });
                }
            });
            this.queued_vehicles.forEach(function (qv) {
                qv.queued_update();
                if (qv instanceof Vehicles.Bus) {
                    response.queued_buses += 1;
                }
            });
            this.vehicles.forEach(function (v) {
                if (v.rear_of() >= _this.end_of()) {
                    _this.sim_statistics.update_vehicle_finished(v);
                    _this.vehicles.remove(v);
                }
                _this.stops.forEach(function (s) {
                    if (v.stop_ahead(s)) {
                        if (s instanceof Stops.BusStop && v instanceof Vehicles.Bus) {
                            if (v.islocalstopping) {
                                if (v.currentState !== Interfaces.VehicleMovementState.stopped) {
                                    if (v.close_enough(s)) {
                                        v.currentState = Interfaces.VehicleMovementState.stopped;
                                        v.stopCountdown_S = s.trafficStop_Trigger_S;
                                    }
                                    if (v.near_stop(s) && v.stopCountdown_S === 0) {
                                        v.currentState = Interfaces.VehicleMovementState.decelerating;
                                        v.currentIntent = Interfaces.VehicleMovementIntent.stopping;
                                    }
                                }
                            }
                        }
                        if (s instanceof Stops.TrafficStop) {
                            if (s.stopping) {
                                if (v.close_enough(s)) {
                                    v.currentState = Interfaces.VehicleMovementState.stopped;
                                    v.stopCountdown_S = s.trafficStop_Trigger_S / _this.config.simFrameRate_Ps;
                                }
                                if (v.near_stop(s) && v.stopCountdown_S === 0) {
                                    v.currentState = Interfaces.VehicleMovementState.decelerating;
                                    v.currentIntent = Interfaces.VehicleMovementIntent.stopping;
                                }
                            }
                            else {
                                v.stopCountdown_S = 0;
                            }
                        }
                    }
                });
                v.update();
            });
            if (this.laneconfig.update_smallbus()) {
                this.queued_vehicles.add(new Vehicles.SmallBus(0, this.yStart_M, 0, 50, this.config, this));
            }
            if (this.laneconfig.update_largebus()) {
                this.queued_vehicles.add(new Vehicles.LargeBus(0, this.yStart_M, 0, 50, this.config, this));
            }
            if (this.laneconfig.update_m30bus()) {
                this.queued_vehicles.add(new Vehicles.M30Bus(0, this.yStart_M, 0, 50, this.config, this));
            }
            if (this.laneconfig.update_blinebus()) {
                this.queued_vehicles.add(new Vehicles.BLineBus(0, this.yStart_M, 0, 50, this.config, this));
            }
            if (this.laneconfig.update_car()) {
                this.queued_vehicles.add(new Vehicles.Car(0, this.yStart_M, 0, 60, this.config, this));
            }
            if (this.vehicles.size() === 0 && this.queued_vehicles.size() > 0) {
                var nextinqueue = this.queued_vehicles.first();
                this.vehicles.add(nextinqueue);
                this.queued_vehicles.remove(nextinqueue);
                nextinqueue.currentState = Interfaces.VehicleMovementState.accelerating;
            }
            else {
                var backmostinlane = this.vehicles.last();
                var nextinqueue = this.queued_vehicles.first();
                if (backmostinlane !== undefined && nextinqueue !== undefined) {
                    if (backmostinlane.front_of() > this.config.minimumDistance_M) {
                        this.vehicles.add(nextinqueue);
                        this.queued_vehicles.remove(nextinqueue);
                    }
                }
            }
            if (this.vehicles.size() >= 1) {
                var f = this.vehicles.elementAtIndex(0);
                if (f.currentState === Interfaces.VehicleMovementState.decelerating && f.stopCountdown_S <= 0 && !f.any_stops_ahead(this.stops)) {
                    f.currentState = Interfaces.VehicleMovementState.accelerating;
                }
            }
            if (this.vehicles.size() >= 2) {
                for (var i = 1; i < this.vehicles.size(); i++) {
                    var ahead = this.vehicles.elementAtIndex(i - 1);
                    var behind = this.vehicles.elementAtIndex(i);
                    var distance = ahead.rear_of() - behind.front_of();
                    var moving_gap = behind.stopping_distance_M();
                    if (behind.currentSpeed_Kmph > 0) {
                        if (distance < moving_gap || distance <= this.config.minimumDistance_M) {
                            behind.currentState = Interfaces.VehicleMovementState.decelerating;
                            behind.queued_time_S += this.config.simFrameRate_Ps;
                        }
                        if (ahead.currentSpeed_Kmph === 0 && distance <= this.config.minimumDistance_M) {
                            behind.currentState = Interfaces.VehicleMovementState.stopped;
                            behind.queued_time_S += this.config.simFrameRate_Ps;
                        }
                    }
                    if (distance >= behind.stopping_distance_M() && behind.currentIntent === Interfaces.VehicleMovementIntent.normal) {
                        behind.currentState = Interfaces.VehicleMovementState.accelerating;
                    }
                }
            }
            response.queued_vehicles = this.queued_vehicles.size();
            return response;
        };
        Lane.prototype.draw = function (p) {
            p.stroke(255);
            p.strokeWeight(1);
            p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
            p.stroke(0);
            this.stops.forEach(function (s) {
                s.draw(p);
            });
            this.vehicles.forEach(function (v) {
                v.draw(p);
            });
        };
        return Lane;
    }());
    exports.Lane = Lane;
});
//# sourceMappingURL=infrastructure.js.map