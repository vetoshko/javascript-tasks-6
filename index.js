'use strict';

var moment = require('./moment');
var robbery = require('./robbery');
// Трое аферистов решили пойти на «дело» ;)
var gang = require('fs').readFileSync('gang.json', 'utf-8');
// Небходимо найти ближайшее свободное время, чтобы ограбить банк в Котеринбурге (часовой пояс +5)
//  - На ограбление понадобится не менее 90 минут,
//  - Все члены банды должны быть свободны в это время
//  - Ограбление должно состоятся в рабочие часы, чтобы двери банка были открыты

var robberyMoment = robbery.getAppropriateMoment(
    // Расписание членов банды
    gang,

    // 90 минут
    90,

    // Рабочие часы банка
    {
        from: '09:00+5',
        to: '21:00+5'
    }
);

console.log(
    robberyMoment.format('Ограбление должно состоятся в %DD. Всем быть готовыми к %HH:%MM!')
);

robberyMoment.timezone = -5; // Переводим время в часовой пояс Дарьи
console.log(
    robberyMoment.format('Дарья, прилетай в Котеринбург в %DD. Собираемся в %HH:%MM!')
);
robberyMoment.timezone = 5; // Переводим время в часовой пояс Котеринбурга
