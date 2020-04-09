const Provider = require('../models/Provider');

const generateKey = require('../modules/generateKey');

require('dotenv').config();

const {
  NEBOTS_TWACCOUNTSID,
  NEBOTS_TWAUTHTOKEN,
  NEBOTS_TWFROM,
  NEBOTS_SERVER
} = process.env;

const tw = require('twilio')(NEBOTS_TWACCOUNTSID, NEBOTS_TWAUTHTOKEN);

module.exports = async (req, res) => {
  let { name, lastName, phone } = req.body || {};
  if (name && lastName && phone) {
    try {
      // Create letters-only unique ID
      let _id = generateKey(12);
      while (await Provider.findOne({ _id })) {
        _id = generateKey(12);
      }

      // Add Spanish prefix if missing
      if (phone.slice(0, 3) != '+34' && phone.slice(0, 4) != '0034') {
        phone = '+34' + phone;
      }

      // Delete if already existing
      await Provider.deleteOne({ phone }).exec();

      await Provider.create({ _id, name, lastName, phone, valid: false });

      const body = `Benvingut a nebots. Segueix aquest enllaç per confirmar el teu compte ${NEBOTS_SERVER}/provider/${_id}?action=validate`;

      // console.log(body);

      tw.messages.create({ body, from: NEBOTS_TWFROM, to: phone });
      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(400);
};