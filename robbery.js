'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var data = JSON.parse(json);
    var newRobbery = getNewRobbery(data);
    var openHour = parseTime(workingHours['from']);
    var closeHour = parseTime(workingHours['to']);
    var robTime = minDuration * 60 * 1000;
    var found = 0;
    for (var i = 1; i < 4; i++) {
        openHour.date = i - 1;
        var todayOpen = getNormalizedTime(openHour);
        closeHour.date = i - 1;
        var todayClose = getNormalizedTime(closeHour);
        if (typeof newRobbery[i] == 'undefined') {
            found = todayOpen;
            break;
        }
        if ((newRobbery[i][0]['from'] - todayOpen) >= robTime) {
            found = newRobbery[i][0]['from'];
            break;
        }
        for (var j = 1; j < newRobbery[i].length; j++) {
            if ((newRobbery[i][j]['from'] - newRobbery[i][j - 1]['to']) >= robTime) {
                found = newRobbery[i][j - 1]['to'];
                break;
            }
        }
        if ((todayClose - newRobbery[i][newRobbery[i].length - 1]['to']) >= robTime) {
            found = newRobbery[i][newRobbery[i].length - 1]['to'];
            break;
        }
        if (found != 0) {
            break;
        }
    }
    // if (found != 0) {
    //     console.log(found);
    // } else {
    //     console.log('Rob will never be!');
    // }
    appropriateMoment.date = found;
    appropriateMoment.timezone = openHour.timezone;
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
    var msInDay = 24 * 3600 * 1000;
    var local_zero = 19 * 3600 * 1000; //because UTC+5 is local time
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
    var msInDay = 24 * 3600 * 1000;
    var newDate = baseDate + (msInDay * timeObj.date);
    newDate += timeObj.hours * 3600 * 1000;
    newDate += timeObj.minutes * 60 * 1000;
    newDate -= timeObj.timezone * 3600 * 1000;
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
        newDate.timezone = parseInt(timeStr.substr(6, 2));
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
