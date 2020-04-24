// Saves a Call when it starts, puts the client on hold and notifies Providers about the call

const { VoiceResponse } = require('twilio').twiml;

const Call = require('../models/Call');
const Provider = require('../models/Provider');
const generateKey = require('../modules/generateKey');
const getDate = require('../modules/getDate');

require('dotenv').config();

const {
  NEBOTS_TWACCOUNTSID,
  NEBOTS_TWAUTHTOKEN,
  NEBOTS_TWSMS,
  NEBOTS_SERVER
} = process.env;

const tw = require('twilio')(NEBOTS_TWACCOUNTSID, NEBOTS_TWAUTHTOKEN);

module.exports = async (req, res) => {
  try {
    // Create letters-only unique ID
    let _id = generateKey(12);
    while (await Call.findOne({ _id })) {
      _id = generateKey(12);
    }

    // CallSid is the call identifier on Twilio's end
    const callSid = req.body.CallSid;

    // Delete if already existing
    await Call.deleteOne({ callSid }).exec();

    await Call.create({ _id, callSid });

    // Send sms to providers

    providers = await Provider.find({ valid: true }).exec();

    for (const provider of providers) {
      const body = `Hola ${provider.name}, una persona necessita la teva ajuda.
      
      Si pots, segueix aquest enllaç per confirmar la trucada ${NEBOTS_SERVER}/call/${_id}?provider=${provider._id}
      
      BAIXA del servei: ${NEBOTS_SERVER}/provider/${provider.id}?action=delete`.replace(
        / {2,}/g,
        ''
      );

      // console.log(body);
      tw.messages.create({ body, from: NEBOTS_TWSMS, to: provider.phone });
    }

    // Prepare response for Twilio
    const twiml = new VoiceResponse();
    twiml.play({ loop: 20 }, 'https://nebots.cat/gracies.mp3');

    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    console.log(`${getDate()} - Call started`);
    return res.send(twiml.toString());
  } catch (error) {
    console.error(`${getDate()} - Error saving Call: ${error.message}`);
    return res.sendStatus(500);
  }
};
