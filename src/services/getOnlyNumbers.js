function onlyNumbers (param) {
    var notDigitRegExp = /\D+/g;
    return param.replace( notDigitRegExp, "");
}

module.exports = onlyNumbers;