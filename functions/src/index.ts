import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
// import * as cors from 'cors';
import * as bodyParser from "body-parser";
import { routesConfig } from "./users/routes-config";
import { sendScheduleNotif, sendRecallNotif } from "./notification/sendNotif";

admin.initializeApp();

const app = express();
app.use(bodyParser.json());
// app.use(cors({ origin: true }));
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,x-access-token, Authorization"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Pass to next layer of middleware
  next();
});
routesConfig(app);


exports.schedule1 = functions.region('europe-west1').pubsub.schedule('45 08 * * 1,3,5').timeZone('Europe/Paris').onRun(async (context)=> {
    console.log('schedule1');
    await sendScheduleNotif();
})
exports.schedule2 = functions.region('europe-west1').pubsub.schedule('45 14 * * 1-5').timeZone('Europe/Paris').onRun(async (context)=> {
    console.log('schedule2');
    await sendScheduleNotif();
})
exports.schedule3 = functions.region('europe-west1').pubsub.schedule('00 08 * * *').timeZone('Europe/Paris').onRun(async (context)=> {
    console.log('schedule3');
    await sendRecallNotif();
})
export const api = functions.https.onRequest(app);