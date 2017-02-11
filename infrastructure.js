define(["require", "exports", "typescript-collections", "./vehicles", "./interfaces", "./stops"], function (require, exports, Collections, Vehicles, Interfaces, Stops) {
    "use strict";
    var LaneStatistics = (function () {
        function LaneStatistics(s) {
            this.bline_pause_time = 0;
            this.queued_vehicles = 0;
            this.queued_buses = 0;
        }
        return LaneStatistics;
    }());
    exports.LaneStatistics = LaneStatistics;
    var Lane = (function () {
        function Lane(_num, _xStart_M, _xEnd_M, _config, _laneconfig, _simstatistics) {
            this.config = _config;
            this.laneconfig = _laneconfig;
            this.sim_statistics = _simstatistics;
            this.num = _num;
            this.xStart_M = _xStart_M;
            this.xEnd_M = _xEnd_M;
            this.laneWidth_M = 4;
            this.yStart_M = (this.num * this.laneWidth_M) + (this.laneWidth_M / 2);
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
        Lane.prototype.update = function (lanes) {
            var _this = this;
            var response = new LaneStatistics();
            this.stops.forEach(function (s) {
                s.update();
            });
            this.queued_vehicles.forEach(function (qv) {
                qv.queued_update();
                if (qv instanceof Vehicles.AbstractBus) {
                    response.queued_buses += 1;
                }
                if (qv instanceof Vehicles.BLineBus) {
                    response.bline_pause_time += qv.stoppedTime_s;
                }
            });
            this.vehicles.forEach(function (v) {
                v.update();
                if ((v.x_M) > _this.xEnd_M) {
                    _this.sim_statistics.update_vehicle_finished(v.deltaD_M, v.deltaT_s);
                    _this.vehicles.remove(v);
                }
                _this.stops.forEach(function (s) {
                    if (s.xStart_M >= v.x_M && s.stopping && s instanceof Stops.BusStop && v instanceof Vehicles.AbstractBus) {
                    }
                    if (s.xStart_M >= v.x_M && s instanceof Stops.TrafficStop) {
                        if (s.stopping) {
                            if (s.xStart_M >= v.x_M && s.xStart_M <= v.x_M + (v.length_M * 0.95)) {
                                v.stopCountdown = s.stop_timing_S;
                            }
                            if (s.xStart_M - (v.x_M + v.length_M) <= v.stopping_distance()) {
                                v.currentState = Interfaces.VehicleMovementState.decelerating;
                                v.currentIntent = Interfaces.VehicleMovementIntent.stopping;
                            }
                        }
                        else {
                            if (s.xStart_M >= v.x_M && s.xStart_M <= v.x_M + v.length_M) {
                                v.stopCountdown = 0;
                                v.currentState = Interfaces.VehicleMovementState.accelerating;
                                v.currentIntent = Interfaces.VehicleMovementIntent.normal;
                            }
                        }
                    }
                });
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
                    if (backmostinlane.x_M > this.config.minimumDistance_M) {
                        this.vehicles.add(nextinqueue);
                        this.queued_vehicles.remove(nextinqueue);
                    }
                }
            }
            if (this.vehicles.size() >= 2) {
                for (var i = 1; i < this.vehicles.size(); i++) {
                    var ahead = this.vehicles.elementAtIndex(i - 1);
                    var behind = this.vehicles.elementAtIndex(i);
                    var distance = ahead.x_M - (behind.x_M + behind.length_M);
                    var moving_gap = behind.stopping_distance();
                    if (behind.currentSpeed_Kmph > 0) {
                        if (distance < moving_gap || distance <= this.config.minimumDistance_M) {
                            behind.currentState = Interfaces.VehicleMovementState.decelerating;
                        }
                        if (ahead.currentSpeed_Kmph === 0 && distance <= this.config.minimumDistance_M) {
                            behind.currentState = Interfaces.VehicleMovementState.stopped;
                        }
                    }
                    if (distance >= moving_gap && behind.currentIntent === Interfaces.VehicleMovementIntent.normal) {
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