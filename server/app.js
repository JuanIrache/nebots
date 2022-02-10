const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postProvider = require('./routes/postProvider');
const getProvider = require('./routes/getProvider');
const deleteProvider = require('./routes/deleteProvider');
const postCall = require('./routes/postCall');
const getCall = require('./routes/getCall');
const ping = require('./routes/ping');
const getDate = require('./modules/getDate');

require('dotenv').config();

const {
  NEBOTS_PORT,
  NEBOTS_CLIENTURL,
  NODE_ENV,
  NEBOTS_ATLAS_USER,
  NEBOTS_ATLAS_PASS,
  NEBOTS_ATLAS_SERVER,
  NEBOTS_ATLAS_DB
} = process.env;

// Parse incoming POST params with Express middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(
  `mongodb+srv://${NEBOTS_ATLAS_USER}:${NEBOTS_ATLAS_PASS}@${NEBOTS_ATLAS_SERVER}/${NEBOTS_ATLAS_DB}?retryWrites=true&w=majority`
);

const corsOptions =
  NODE_ENV === 'production'
    ? { origin: NEBOTS_CLIENTURL, optionsSuccessStatus: 200 }
    : {};

app.use(cors(corsOptions));

// Add provider
app.post('/provider', postProvider);

// Validate or delete provider
app.get('/provider/:id', getProvider);

// Delete provider
app.delete('/provider', deleteProvider);

// Add call
app.post('/call', postCall);

// Confirm call
app.get('/call/:id', getCall);

//Check server status
app.get('/ping', ping);

app.listen(NEBOTS_PORT, () =>
  console.log(`${getDate()} - Listening on port ${NEBOTS_PORT}`)
);
