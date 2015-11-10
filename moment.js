'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        date: null,

        // А здесь часовой пояс
        timezone: null,

        // Выводит дату в переданном формате
        format: function (pattern) {
            var numberToWord = {
                1: 'ПН',
                2: 'ВТ',
                3: 'СР'
            };
            var minutes = this.date.getMinutes();
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            pattern = pattern.replace('%DD', numberToWord[this.date.getDay()]);
            pattern = pattern.replace('%HH', this.date.getUTCHours() + this.timezone);
            pattern = pattern.replace('%MM', minutes);
            return pattern;
        },
        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {

    };
};

function parseData(data) {
    // 'ПН 12:59+5'
    var wordToNumber = {
        'ПН': 0,
        'ВТ': 1,
        'СР': 2
    };
    var newDate = {};
    newDate.day = wordToNumber(data.substr(0, 2));
    newDate.hour = data.substr(3, 2);
    newDate.minutes = data.substr(6, 2);
    newDate.zone = data.substr(8, 2);
    return newDate;
}
