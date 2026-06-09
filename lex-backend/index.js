import * as functions from "firebase-functions";
import app from "./src/app.js";

export const lexBackend = functions.https.onRequest(app);
