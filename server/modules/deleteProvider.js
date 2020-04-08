const { v4: uuidv4 } = require('uuid');

const Provider = require('../models/Provider');

require('dotenv').config();

const {
  NEBOTS_TWACCOUNTSID,
  NEBOTS_TWAUTHTOKEN,
  NEBOTS_TWFROM,
  NEBOTS_SERVER
} = process.env;

const tw = require('twilio')(NEBOTS_TWACCOUNTSID, NEBOTS_TWAUTHTOKEN);

module.exports = async (req, res) => {
  let { phone } = req.body || {};
  if (phone) {
    try {
      // Add Spanish prefix if missing
      if (phone.slice(0, 3) != '+34' && phone.slice(0, 4) != '0034') {
        phone = '+34' + phone;
      }

      const provider = Provider.findOne({ phone });

      if (!provider) {
        return res.sendStatus(500);
      }

      const body = `Per confirmar la baixa de nebots, segueix aquest enllaç ${NEBOTS_SERVER}/provider/${_id}?action=delete`;

      tw.messages.create({ body, from: NEBOTS_TWFROM, to: phone });
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  }
  return res.sendStatus(400);
};
