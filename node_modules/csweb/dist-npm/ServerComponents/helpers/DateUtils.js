Date.prototype.minValue = new Date(0);
Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};
Date.prototype.addMinutes = function (mins) {
    var dat = new Date(0);
    dat.setMilliseconds(this.getTime() + (mins * 60000));
    return dat;
};
Date.prototype.addSeconds = function (secs) {
    var dat = new Date(0);
    dat.setMilliseconds(this.getTime() + (secs * 1000));
    return dat;
};
Date.prototype.diffDays = function (date) {
    var diffMs = (this.getTime() - date.getTime());
    return Math.round(diffMs / 86400000);
};
Date.prototype.diffHours = function (date) {
    var diffMs = (this.getTime() - date.getTime());
    return Math.round(diffMs / 3600000);
};
Date.prototype.diffMinutes = function (date) {
    var diffMs = (this.getTime() - date.getTime());
    return Math.round(diffMs / 60000);
};
Date.prototype.diffSeconds = function (date) {
    var diffMs = (this.getTime() - date.getTime());
    return Math.round(diffMs / 1000);
};
//# sourceMappingURL=DateUtils.js.map