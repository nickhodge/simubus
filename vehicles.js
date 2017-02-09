var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./interfaces"], function (require, exports, Interfaces) {
    "use strict";
    var BaseVehicle = (function () {
        function BaseVehicle(_description, _vehicleLength_M, _acceleration_MpS, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            this.description = _description;
            this.lane = _lane;
            this.config = _config;
            this.x_M = _x_M - _vehicleLength_M;
            this.y_M = _y_M;
            this.maxSpeed_Kmph = _maxSpeed_Kmph;
            this.stoppedTime_s = 0;
            this.deltaT_s = 0;
            this.deltaD_M = 0;
            this.initialSpeed_Kmph = _initialSpeed_Kmph;
            this.currentSpeed_Kmph = this.initialSpeed_Kmph;
            this.length_M = _vehicleLength_M;
            this.pixelLength = this.length_M * this.config.simScale_PpM;
            this.width_M = 3;
            this.pixelWidth = this.width_M * this.config.simScale_PpM;
            this.currentState = Interfaces.VehicleMovementState.stopped;
            this.stopCountdown = 0;
            this.acceleration_MpS = _acceleration_MpS;
            this.fillcolour_rgb = "#aaa";
            this.strokecolour_rgb = this.fillcolour_rgb;
        }
        BaseVehicle.prototype.queued_update = function () {
            this.deltaT_s += this.config.simFrameRate_Ps;
            this.stoppedTime_s += this.config.simFrameRate_Ps;
        };
        BaseVehicle.prototype.update = function () {
            switch (this.currentState) {
                case Interfaces.VehicleMovementState.decelerating:
                    this.strokecolour_rgb = "#f00";
                    this.currentSpeed_Kmph -= this.config.MpsToKmphTick(this.acceleration_MpS);
                    if (this.currentSpeed_Kmph < 0) {
                        this.strokecolour_rgb = this.fillcolour_rgb;
                        this.currentSpeed_Kmph = 0;
                    }
                    this.x_M = this.x_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
                    break;
                case Interfaces.VehicleMovementState.stopped:
                    this.strokecolour_rgb = this.fillcolour_rgb;
                    this.currentSpeed_Kmph = 0;
                    this.x_M = this.x_M;
                    this.stoppedTime_s += this.config.simFrameRate_Ps;
                    break;
                case Interfaces.VehicleMovementState.accelerating:
                    this.strokecolour_rgb = "#0f0";
                    this.currentSpeed_Kmph += this.config.MpsToKmphTick(this.acceleration_MpS);
                    if (this.currentSpeed_Kmph > this.maxSpeed_Kmph) {
                        this.strokecolour_rgb = "#040";
                        this.currentSpeed_Kmph = this.maxSpeed_Kmph;
                        this.currentState = Interfaces.VehicleMovementState.cruising;
                    }
                    this.x_M = this.x_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
                    break;
                case Interfaces.VehicleMovementState.cruising:
                    this.strokecolour_rgb = "#070";
                    this.x_M = this.x_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
                    break;
                case Interfaces.VehicleMovementState.waiting:
                    this.strokecolour_rgb = this.fillcolour_rgb;
                    this.x_M = this.x_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
                    break;
                default:
            }
            this.deltaD_M += (this.config.KmphPerTick(this.currentSpeed_Kmph));
            this.deltaT_s += this.config.simFrameRate_Ps;
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
            p.rect(this.x_M * this.config.simScale_PpM, this.y_M * this.config.simScale_PpM, this.pixelLength, this.pixelWidth);
        };
        return BaseVehicle;
    }());
    exports.BaseVehicle = BaseVehicle;
    var SmallBus = (function (_super) {
        __extends(SmallBus, _super);
        function SmallBus(_x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "Small Bus 12.5m", 12.5, 1.25, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.fillcolour_rgb = "#00f";
            return _this;
        }
        return SmallBus;
    }(BaseVehicle));
    exports.SmallBus = SmallBus;
    var LargeBus = (function (_super) {
        __extends(LargeBus, _super);
        function LargeBus(_x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "Large Articulated Bus 18m", 18, 1.0, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.fillcolour_rgb = "#00f";
            return _this;
        }
        return LargeBus;
    }(BaseVehicle));
    exports.LargeBus = LargeBus;
    var BLineBus = (function (_super) {
        __extends(BLineBus, _super);
        function BLineBus(_x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "BLine Bus 12.5m", 12, 1.15, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.fillcolour_rgb = "#ff0";
            return _this;
        }
        return BLineBus;
    }(BaseVehicle));
    exports.BLineBus = BLineBus;
    var Car = (function (_super) {
        __extends(Car, _super);
        function Car(_x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) {
            var _this = _super.call(this, "Car 4.9m", 4.9, 2.75, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane) || this;
            _this.acceleration_MpS += (0.5 - Math.random()) * 2;
            _this.maxSpeed_Kmph += (0.5 - Math.random()) * 5;
            return _this;
        }
        return Car;
    }(BaseVehicle));
    exports.Car = Car;
});
//# sourceMappingURL=vehicles.js.map