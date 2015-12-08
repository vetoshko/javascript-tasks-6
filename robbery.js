'use strict';

var moment = require('./moment');
var msInSeconds = 1000;
var secondsInMinute = 60;
var minutesInHour = 60;
var hoursInDay = 24;

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var data = JSON.parse(json);
    var newRobbery = getNewRobbery(data);
    var openHour = parseTime(workingHours['from']);
    var closeHour = parseTime(workingHours['to']);
    var robTime = minDuration * secondsInMinute * msInSeconds;
    var found = 0;
    for (var i = 1; i < 4; i++) {
        openHour.date = i - 1;
        var todayOpen = getNormalizedTime(openHour);
        if (closeHour.hours == 0) {
            closeHour.date = i;
        } else {
            closeHour.date = i - 1;
        }

        var todayClose = getNormalizedTime(closeHour);
        if ((todayClose - todayOpen) < robTime) {
            break;
        }

        if ((typeof newRobbery[i] == 'undefined') ||
        ((newRobbery[i][0]['from'] - todayOpen) >= robTime)) {
            found = todayOpen;
            break;
        }
        for (var j = 1; j < newRobbery[i].length; j++) {
            if ((newRobbery[i][j]['from'] - newRobbery[i][j - 1]['to']) >= robTime) {
                if ((newRobbery[i][j - 1]['to'] >= todayOpen) &&
                (newRobbery[i][j]['from'] <= todayClose)) {
                    found = newRobbery[i][j - 1]['to'];
                    break;
                }
            }
        }
        if ((todayClose - newRobbery[i][newRobbery[i].length - 1]['to']) >= robTime) {
            if (newRobbery[i][newRobbery[i].length - 1]['to'] >= todayOpen) {
                found = newRobbery[i][newRobbery[i].length - 1]['to'];
            } else {
                found = todayOpen;
            };

            break;
        }
        if (found != 0) {
            break;
        }
    }

    appropriateMoment.date = found;
    appropriateMoment.timezone = found.getTimezoneOffset() / -60;
    return appropriateMoment;
};


function sortPeriodes(a, b) {
    if (a['from'] < b['from']) {
        return -1;
    }
    if (a['from'] > b['from']) {
        return 1;
    }
    return 0;
}


function getNewRobbery(data) {
    var tempRobbery = {};
    for (var name in data) {
        for (var day = 0; day < data[name].length; day++) {
            var parsed_time = getCorrectTime(data[name][day]);
            for (var time_num = 0; time_num < parsed_time.length; time_num++) {
                var current_day = parsed_time[time_num]['from'].getDay();
                if (typeof tempRobbery[current_day] == 'undefined') {
                    tempRobbery[current_day] = [];
                }
                tempRobbery[current_day].push(parsed_time[time_num]);
            }
        }
    }
    for (var day in tempRobbery) {
        tempRobbery[day] = tempRobbery[day].sort(sortPeriodes);
    }
    return tempRobbery;
}


function getCorrectTime(time) {
    var from_date = getNormalizedTime(parseTime(time['from']));
    var to_date = getNormalizedTime(parseTime(time['to']));
    var result = [];
    var msInDay = hoursInDay * minutesInHour * secondsInMinute * msInSeconds;
    var localTimezone = new Date().getTimezoneOffset() / -minutesInHour;
    var local_zero = (hoursInDay - localTimezone) * minutesInHour * secondsInMinute * msInSeconds;
    var temp_result = {};
    temp_result['from'] = from_date;
    if (from_date.getDay() != to_date.getDay()) {
        var temp = new Date(from_date.valueOf() + (local_zero - (from_date.valueOf() % msInDay)));
        temp_result['to'] = temp;
        result.push(temp_result);
        var temp_result = {};
        temp_result['from'] = temp;
    }
    temp_result['to'] = to_date;
    result.push(temp_result);
    return result;
}

function getNormalizedTime(timeObj) {

    var baseDate = Date.UTC(2015, 10, 9);
    var msInDay = hoursInDay * minutesInHour * secondsInMinute * msInSeconds;
    var newDate = baseDate + (msInDay * timeObj.date);
    newDate += timeObj.hours * minutesInHour * secondsInMinute * msInSeconds;
    newDate += timeObj.minutes * secondsInMinute * msInSeconds;
    newDate -= timeObj.timezone * minutesInHour * secondsInMinute * msInSeconds;
    return new Date(newDate);
}

function parseTime(timeStr) {
    var wordToNumber = {
        'ПН': 0,
        'ВТ': 1,
        'СР': 2
    };
    var newDate = {};
    if (timeStr.length == 10) {
        newDate.date = wordToNumber[timeStr.substr(0, 2)];
        newDate.hours = parseInt(timeStr.substr(3, 2));
        newDate.minutes = parseInt(timeStr.substr(6, 2));
        newDate.timezone = parseInt(timeStr.substr(8, 2));
    } else {
        newDate.date = -1;
        newDate.hours = parseInt(timeStr.substr(0, 2));
        newDate.minutes = parseInt(timeStr.substr(3, 2));
        newDate.timezone = parseInt(timeStr.substr(5, 2));
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
