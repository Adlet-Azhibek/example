

function formatPhoneNumber(phoneNumberString) {// 87772223344 =>> +7 (777) 222-3344
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  var match = cleaned.match(/^(7|8)?(\d{3})(\d{3})(\d{2})(\d{2})$/)
    //console.log(match)
  if (match) {
    var intlCode = (match[1] ? '+7 ' : '')
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4], '-', match[5]].join('')
  }
  return null
}



module.exports = formatPhoneNumber;