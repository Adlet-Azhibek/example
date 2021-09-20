var isTest = true;

if(isTest){
    var obj = {
        randomCodeExpirationInMinutes : 1, //сколько минут будет действителен отправленный смс код
        smsDelayInMinutes: 0.5, //через сколько минут можно будет перезапросить новый код
        fixedTimeToCheckInMinutes: 6, //проверяются все запросы кода за последние минуты с текущего времени
        allowedSmsAmoutInFixedTime: 3, //сколько смс можно запросить за fixedTime (параметр выше)
        allowedSmsAmoutInFixedTimeGeneral: 3,//General
        blockMinutesAfterFixedAmountOfSmsGeneral: 30,//General
        fixedMinutesToCheckInMinutesGeneral: 30, //General
        blockMinutesAfterFixedAmountOfSms: 5, //на сколькот минут заблокируется отправка смс после определенного колчества запросов
        isTest: isTest,
        allowedPhoneNumbers: ['77777945569'
        ]
    };
}
else{
    var obj = {
        randomCodeExpirationInMinutes : 30, //сколько минут будет действителен отправленный смс код
        smsDelayInMinutes: 1, //через сколько минут можно будет перезапросить новый код
        fixedTimeToCheckInMinutes: 32, //проверяются все запросы кода за последние минуты с текущего времени
        allowedSmsAmoutInFixedTime: 3, //сколько смс можно запросить за fixedTime (параметр выше)
        allowedSmsAmoutInFixedTimeGeneral: 3,//General
        blockMinutesAfterFixedAmountOfSmsGeneral: 30,//General
        fixedMinutesToCheckInMinutesGeneral: 30, //General
        blockMinutesAfterFixedAmountOfSms: 30, //на сколькот минут заблокируется отправка смс после определенного колчества запросов
        isTest: isTest
    };
}


module.exports = obj;