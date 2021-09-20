var env = 'test';
var domain = '';
var nsi_domain = '';

switch (env) {
    case 'dev':
        domain = 'https://private_param/';
        nsi_domain = 'http://private_param/';
      break;
    case 'test':
        domain = 'https://private_param/';
        nsi_domain = 'http://private_param/';
      break;
    case 'prod':
        domain = 'https://private_param/';
        nsi_domain = 'http://private_param/';
      break;
    default:
        domain = 'https://private_param/';
        nsi_domain = 'http://private_param/';
  }


module.exports = {
    domain: domain,
    nsi_domain: nsi_domain
}