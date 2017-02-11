define(["require", "exports"], function (require, exports) {
    "use strict";
    var LaneSimConfig = (function () {
        function LaneSimConfig(_smallbus_pH, _largebus_pH, _m30bus_pH, _blinebus_pH, _car_pH, _config) {
            this.config = _config;
            this.smallbus_pH = _smallbus_pH;
            this.largebus_pH = _largebus_pH;
            this.m30bus_pH = _m30bus_pH;
            this.blinebus_pH = _blinebus_pH;
            this.car_pH = _car_pH;
            this.smallbus_Trigger = -1;
            this.largebus_Trigger = -1;
            this.m30bus_Trigger = -1;
            this.blinebus_Trigger = -1;
            this.car_Trigger = -1;
        }
        LaneSimConfig.prototype.start = function () {
            if (this.smallbus_pH !== 0)
                this.smallbus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.smallbus_pH;
            if (this.largebus_pH !== 0)
                this.largebus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.largebus_pH;
            if (this.m30bus_pH !== 0)
                this.m30bus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.m30bus_pH;
            if (this.blinebus_pH !== 0)
                this.blinebus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.blinebus_pH;
            if (this.car_pH !== 0)
                this.car_Trigger = ((60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.car_pH) * this.config.getRandomInRange(0.95, 1.05);
        };
        LaneSimConfig.prototype.update_smallbus = function () {
            if (this.smallbus_Trigger < 0)
                return false;
            this.smallbus_Trigger--;
            if (this.smallbus_Trigger < 1) {
                this.smallbus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.smallbus_pH;
                return true;
            }
            else {
                return false;
            }
        };
        LaneSimConfig.prototype.update_largebus = function () {
            if (this.largebus_Trigger < 0)
                return false;
            this.largebus_Trigger--;
            if (this.largebus_Trigger < 1) {
                this.largebus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.largebus_pH;
                return true;
            }
            else {
                return false;
            }
        };
        LaneSimConfig.prototype.update_m30bus = function () {
            if (this.m30bus_Trigger < 0)
                return false;
            this.m30bus_Trigger--;
            if (this.m30bus_Trigger < 1) {
                this.m30bus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.m30bus_pH;
                return true;
            }
            else {
                return false;
            }
        };
        LaneSimConfig.prototype.update_blinebus = function () {
            if (this.blinebus_Trigger < 0)
                return false;
            this.blinebus_Trigger--;
            if (this.blinebus_Trigger < 1) {
                this.blinebus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.blinebus_pH;
                return true;
            }
            else {
                return false;
            }
        };
        LaneSimConfig.prototype.update_car = function () {
            if (this.car_Trigger < 0)
                return false;
            this.car_Trigger--;
            if (this.car_Trigger < 1) {
                this.car_Trigger = ((60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.car_pH) * this.config.getRandomInRange(0.95, 1.05);
                return true;
            }
            else {
                return false;
            }
        };
        return LaneSimConfig;
    }());
    exports.LaneSimConfig = LaneSimConfig;
    var SimConfig = (function () {
        function SimConfig(c) {
            this.absoluteTime_s = 0;
            this.pixelHeight_P = 160;
            this.pixelWidth_P = 1000;
            this.simDistance_M = 300;
            this.simScale_PpM = this.pixelWidth_P / this.simDistance_M;
            this.frameRate_Ps = 30;
            this.simFrameRate_Ps = 1 / this.frameRate_Ps;
            this.simSpeed = 1.0;
            this.stoppingDistance_S = 1.4;
            this.minimumDistance_M = 2;
            this.fromStopGapRatio = 0.5;
            this.braking_MpS = 4;
        }
        SimConfig.prototype.KmphPerTick = function (kmph) {
            return (((kmph * 1000) / 60) / 60 / (this.frameRate_Ps * this.simSpeed));
        };
        ;
        SimConfig.prototype.MpsPerTick = function (m) {
            return (m / (this.frameRate_Ps * this.simSpeed));
        };
        ;
        SimConfig.prototype.MpsToKmphTick = function (mps) {
            return (mps / 1000) * 60 * 60 / (this.frameRate_Ps * this.simSpeed);
        };
        ;
        SimConfig.prototype.TicksToSeconds = function (ticks) {
            return (ticks * (this.frameRate_Ps * this.simSpeed));
        };
        SimConfig.prototype.KmphToMps = function (kmph) {
            return (kmph * 1000 / 60 / 60);
        };
        SimConfig.prototype.getRandomInRange = function (min, max) {
            return Math.random() * (max - min) + min;
        };
        SimConfig.prototype.secondsToHMS = function (secs) {
            var date = new Date(null);
            date.setSeconds(secs);
            return date.toISOString().substr(11, 8);
        };
        return SimConfig;
    }());
    exports.SimConfig = SimConfig;
});
//# sourceMappingURL=config.js.map