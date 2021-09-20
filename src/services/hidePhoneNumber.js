

function hidePhoneNumber(phone_number) { // 77772223344 =>> 7777-***-**-44
    return phone_number.substring(0, 4) + '-***-**-' + phone_number.substring(9, phone_number.length)
}



module.exports = hidePhoneNumber;