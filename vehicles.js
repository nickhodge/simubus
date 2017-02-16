var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./interfaces", "./stops"], function (require, exports, Interfaces, Stops) {
    "use strict";
    var BaseVehicle = (function () {
        function BaseVehicle(_description, _vehicleLength_M, _acceleration_MpS, _deleration_MpS, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            this.description = _description;
            this.lane = _lane;
            this.config = _config;
            this.xStart_M = _x_M - _vehicleLength_M - this.config.minimumDistance_M;
            this.yStart_M = _y_M;
            this.length_M = _vehicleLength_M;
            this.maxSpeed_Kmph = _maxSpeed_Kmph;
            this.width_M = 3;
            this.stoppedTime_S = 0;
            this.deltaT_S = 0;
            this.deltaD_M = 0;
            this.queued_time_S = 0;
            this.initialSpeed_Kmph = _initialSpeed_Kmph;
            this.currentSpeed_Kmph = this.initialSpeed_Kmph;
            this.pixelLength = this.length_M * this.config.simScale_PpM;
            this.pixelWidth = this.width_M * this.config.simScale_PpM;
            this.currentState = Interfaces.VehicleMovementState.stopped;
            this.currentIntent = Interfaces.VehicleMovementIntent.normal;
            this.stopCountdown_S = 0;
            this.acceleration_MpS = _acceleration_MpS;
            this.deleration_MpS = _deleration_MpS;
            this.fillcolour_rgb = "#aaa";
            this.strokecolour_rgb = this.fillcolour_rgb;
        }
        BaseVehicle.prototype.stopping_distance_M = function () {
            return ((Math.pow(this.config.KmphToMps(this.currentSpeed_Kmph), 2)) / (2 * this.config.coefficientfriction * this.config.gravity)) + this.config.reactionTimeToM(this.currentSpeed_Kmph);
        };
        BaseVehicle.prototype.front_of = function () {
            return (this.xStart_M + this.length_M);
        };
        BaseVehicle.prototype.rear_of = function () {
            return (this.xStart_M);
        };
        BaseVehicle.prototype.stop_ahead = function (s) {
            if (s.front_of() > this.rear_of())
                return true;
            else
                return false;
        };
        BaseVehicle.prototype.any_stops_ahead = function (s) {
            var that = this;
            var stopAhead = false;
            s.forEach(function (st) {
                if (st instanceof Stops.TrafficStop && that.stop_ahead(st)) {
                    stopAhead = true;
                }
            });
            return stopAhead;
        };
        BaseVehicle.prototype.distance_between = function (r) {
            return ((r.xStart_M + r.length_M) - this.front_of());
        };
        BaseVehicle.prototype.near_stop = function (s) {
            if (this.distance_between(s) <= this.stopping_distance_M())
                return true;
            else
                return false;
        };
        BaseVehicle.prototype.close_enough = function (s) {
            if (Math.abs(this.distance_between(s)) <= this.config.minimumDistance_M)
                return true;
            else
                return false;
        };
        BaseVehicle.prototype.queued_update = function () {
            this.deltaT_S += this.config.simFrameRate_Ps;
            this.stoppedTime_S += this.config.simFrameRate_Ps;
        };
        BaseVehicle.prototype.update = function () {
            if (this.stopCountdown_S > 0) {
                this.stopCountdown_S -= (this.config.simFrameRate_Ps);
                this.currentState = Interfaces.VehicleMovementState.stopped;
                if (this.stopCountdown_S <= 0) {
                    this.currentIntent = Interfaces.VehicleMovementIntent.leavingstop;
                    this.currentState = Interfaces.VehicleMovementState.accelerating;
                }
            }
            switch (this.currentState) {
                case Interfaces.VehicleMovementState.decelerating:
                    this.strokecolour_rgb = "#f00";
                    this.currentSpeed_Kmph -= this.config.MpsToKmphTick(this.deleration_MpS);
                    if (this.currentSpeed_Kmph < 0) {
                        this.strokecolour_rgb = this.fillcolour_rgb;
                        this.currentSpeed_Kmph = 0;
                    }
                    this.xStart_M = this.xStart_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
                    break;
                case Interfaces.VehicleMovementState.stopped:
                    this.strokecolour_rgb = this.fillcolour_rgb;
                    this.currentSpeed_Kmph = 0;
                    this.xStart_M = this.xStart_M;
                    this.stoppedTime_s += this.config.simFrameRate_Ps;
                    break;
                case Interfaces.VehicleMovementState.accelerating:
                    this.strokecolour_rgb = "#0f0";
                    this.currentSpeed_Kmph += this.config.MpsToKmphTick(this.acceleration_MpS);
                    if (this.currentSpeed_Kmph > this.maxSpeed_Kmph) {
                        this.strokecolour_rgb = "#070";
                        this.currentSpeed_Kmph = this.maxSpeed_Kmph;
                        this.currentState = Interfaces.VehicleMovementState.cruising;
                    }
                    this.xStart_M = this.xStart_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
                    break;
                case Interfaces.VehicleMovementState.cruising:
                    this.strokecolour_rgb = "#070";
                    this.xStart_M = this.xStart_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
                    break;
                default:
            }
            this.deltaD_M += this.config.KmphPerTick(this.currentSpeed_Kmph);
            this.deltaT_S += this.config.simFrameRate_Ps;
        };
        BaseVehicle.prototype.draw = function (p) {
            p.fill(this.fillcolour_rgb);
            p.stroke(this.strokecolour_rgb);
            if (this.currentSpeed_Kmph < this.maxSpeed_Kmph) {
                p.strokeWeight(3);
            }
            else {
                p.strokeWeight(1);
            }
            p.rect(this.xStart_M * this.config.simScale_PpM, this.yStart_M * this.config.simScale_PpM, this.pixelLength, this.pixelWidth);
        };
        return BaseVehicle;
    }());
    exports.BaseVehicle = BaseVehicle;
    var Bus = (function (_super) {
        __extends(Bus, _super);
        function Bus(_description, _vehicleLength_M, _acceleration_MpS, _deleration_MpS, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, _description, _vehicleLength_M, _acceleration_MpS, _deleration_MpS, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.islocalstopping = false;
            return _this;
        }
        return Bus;
    }(BaseVehicle));
    exports.Bus = Bus;
    var SmallBus = (function (_super) {
        __extends(SmallBus, _super);
        function SmallBus(_xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "Small Bus 12.5m", 12.5, 1.25, 2.2, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.fillcolour_rgb = "#00d";
            _this.islocalstopping = (_this.config.getRandomInRange(1, 3) === 2);
            return _this;
        }
        return SmallBus;
    }(Bus));
    exports.SmallBus = SmallBus;
    var LargeBus = (function (_super) {
        __extends(LargeBus, _super);
        function LargeBus(_xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "Large Articulated Bus 18m", 18, 1.0, 2.0, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.fillcolour_rgb = "#00f";
            return _this;
        }
        return LargeBus;
    }(Bus));
    exports.LargeBus = LargeBus;
    var M30Bus = (function (_super) {
        __extends(M30Bus, _super);
        function M30Bus(_xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "M30 Bus 18m", 18, 1.0, 2.0, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.fillcolour_rgb = "#f00";
            _this.islocalstopping = (_this.config.getRandomInRange(1, 2) === 2);
            return _this;
        }
        return M30Bus;
    }(Bus));
    exports.M30Bus = M30Bus;
    var BLineBus = (function (_super) {
        __extends(BLineBus, _super);
        function BLineBus(_xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "BLine Bus 12.5m", 12, 1.15, 2.0, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.fillcolour_rgb = "#ff0";
            return _this;
        }
        return BLineBus;
    }(Bus));
    exports.BLineBus = BLineBus;
    var Car = (function (_super) {
        __extends(Car, _super);
        function Car(_xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "Car 4.9m", 4.9, 2.5, 3.2, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.acceleration_MpS += (0.5 - Math.random()) * 2;
            _this.maxSpeed_Kmph += (0.5 - Math.random()) * 8;
            return _this;
        }
        return Car;
    }(BaseVehicle));
    exports.Car = Car;
});
//# sourceMappingURL=vehicles.js.map