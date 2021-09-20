var {nsi_domain} = require('./environment');

module.exports = {
  nsi_getCustomerPhoneByIin: nsi_domain+'NSI/hs/CAR/PhoneNumberViaIIN/',
  nsi_phoneNumberSet: nsi_domain+'NSI/hs/CCDC/phoneNumberSet'
};