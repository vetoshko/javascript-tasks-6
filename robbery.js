'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var data = JSON.parse(json);
    var newRobbery = getNewRobbery(data);
    var openHour = parseTime(workingHours["from"]);
    var closeHour = parseTime(workingHours["to"]);
    var hoursDuration = Math.floor(minDuration / 60);
    var minutesDuration = minDuration % 60;
    var msInDay = 24*3600*1000;
    var tempDate = new Date().getTime()
    for (var days = 0; days < 8; days++) {
        var currentDate = new Date(tempDate + days * msInDay);
        if (currentDate.getDay() > 0 && currentDate.getDay() < 4) {
            console.log(newRobbery[currentDate.getDay()]);

        }
    }
    return appropriateMoment;
};


function getNewRobbery(data) {
    var newRobbery = {}
    for (var name in data) {
        for (var day = 0; day < data[name].length; day++) {
            var fixed_day = day + 1;
            if (typeof newRobbery[fixed_day] == 'undefined')
                newRobbery[fixed_day] = [];
            if (typeof newRobbery[fixed_day][name] == 'undefined')
                newRobbery[fixed_day][name] = [];
            var time = {};
            for (var prop in data[name][day]) {
                var correctTime = getCorrectTime(data[name][day][prop]);
                time[prop] = correctTime;
            }
            newRobbery[fixed_day][name].push(time);
        }
    }
    return newRobbery;
}


function getCorrectTime(time) {
    var newDate = parseTime(time);
    return newDate;
}

function parseTime(timeStr) {

    var wordToNumber = {
        'ПН' : 1,
        'ВТ' : 2,
        'СР' : 3
    }
    var newDate = {}
    if (timeStr.length == 10) {
        newDate.date = wordToNumber[timeStr.substr(0, 2)];
        newDate.hours = timeStr.substr(3, 2);
        newDate.minutes = timeStr.substr(6, 2);
        newDate.timezone = timeStr.substr(8, 2);
    } else {
        newDate.hours = timeStr.substr(0, 2);
        newDate.minutes = timeStr.substr(3, 2);
        newDate.timezone = timeStr.substr(6, 2);
    }
    return newDate;
}
// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};
