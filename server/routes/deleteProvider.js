// Receives the delete Provider request and sends a confirmation SMS

const Provider = require('../models/Provider');
const getDate = require('../modules/getDate');
const formatPhone = require('../modules/formatPhone');

require('dotenv').config();

const {
  NEBOTS_TWACCOUNTSID,
  NEBOTS_TWAUTHTOKEN,
  NEBOTS_TWSMS,
  NEBOTS_SERVER
} = process.env;

const tw = require('twilio')(NEBOTS_TWACCOUNTSID, NEBOTS_TWAUTHTOKEN);

module.exports = async (req, res) => {
  let { phone } = req.body || {};
  if (phone) {
    try {
      // Add Spanish prefix if missing
      phone = formatPhone(phone);

      const provider = await Provider.findOne({ phone }).exec();

      if (!provider) {
        return res.sendStatus(400);
      }

      const body = `Per confirmar la baixa de nebots, segueix aquest enllaç ${NEBOTS_SERVER}/provider/${provider._id}?action=delete`;

      // console.log(body);

      tw.messages.create({ body, from: NEBOTS_TWSMS, to: phone });
      console.log(`${getDate()} - Delete provider request`);
      return res.sendStatus(200);
    } catch (error) {
      console.error(
        `${getDate()} - Error requesting Provider delete: ${error.message}`
      );
      return res.sendStatus(500);
    }
  }
  console.error(`${getDate()} - Phone not present in body`);
  return res.sendStatus(400);
};
