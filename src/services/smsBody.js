

function smsBody(data) {
    var random_code = data.random_code;
    var app_id = '2T/TQ48VlsP';
    var action = data.action;
    if (action == 'signup'){
        return random_code+' - ваш код для регистрации. '+ app_id
    }
    else if(action == 'resetPassword'){
        return random_code+' - ваш код для восстановления пароля. '+ app_id
    }
    else{
        return 'Никому не говорите код: '+ random_code + '. '+ app_id
    }
}



module.exports = smsBody;