// Receives a call confirmation from the SMS notification and tries to establish a connection

const { VoiceResponse } = require('twilio').twiml;

const Provider = require('../models/Provider');
const Call = require('../models/Call');
const getDate = require('../modules/getDate');
const generateKey = require('../modules/generateKey');

const { NEBOTS_TWACCOUNTSID, NEBOTS_TWAUTHTOKEN, NEBOTS_TWPROXY } = process.env;

const tw = require('twilio')(NEBOTS_TWACCOUNTSID, NEBOTS_TWAUTHTOKEN);

module.exports = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      _id: req.query.provider
    }).exec();

    const call = await Call.findOne({
      _id: req.params.id
    }).exec();

    if (!call) {
      console.error(`${getDate()} - Call not found`);
      return res
        .status(200)
        .send('<h1>Gràcies, la trucada ja ha estat atesa</h1>');
    }

    if (!provider) {
      console.error(`${getDate()} - Provider not found`);
      return res.status(400).send('<h1>Alguna cosa ha anat malament</h1>');
    }

    console.log('proxy', NEBOTS_TWPROXY);

    const session = await tw.proxy
      .services(NEBOTS_TWPROXY)
      .sessions.create({ uniqueName: generateKey(10) });

    console.log('got session');
    const { proxyIdentifier } = await tw.proxy
      .services(NEBOTS_TWPROXY)
      .sessions(session.sid)
      .participants.create({
        friendlyName: 'Client',
        identifier: call.from
      });

    console.log('got user', proxyIdentifier);

    await tw.proxy
      .services(NEBOTS_TWPROXY)
      .sessions(session.sid)
      .participants.create({
        friendlyName: 'Provider',
        identifier: provider.phone
      });

    console.log('got user 2');
    const response = new VoiceResponse();
    response.dial(proxyIdentifier);
    tw.calls(call.callSid).update({ twiml: response.toString() });
    Call.deleteOne({ _id: req.params.id }, () => {});
    console.log(`${getDate()} - Establishing call`);

    return res
      .status(200)
      .send(
        `<h1>Gràcies. Si l'usuari segueix en línia iniciarem la connexió</h1>`
      );
  } catch (error) {
    console.error(`${getDate()} - Error establishing call: ${error.message}`);
    return res.status(500).send('<h1>Alguna cosa ha anat malament</h1>');
  }
};
