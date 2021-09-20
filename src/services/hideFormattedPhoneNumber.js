

function hideFormattedPhoneNumber(phone_number) {// +7 (777) 222-3344 =>> "+7 (777) ***-**44"
    return phone_number.substring(0, 8) + ' ***-**' + phone_number.substring(15, phone_number.length)
}

module.exports = hideFormattedPhoneNumber;