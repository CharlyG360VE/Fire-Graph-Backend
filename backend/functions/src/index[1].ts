import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firestore-graph-b66ee.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({
    mensaje: "Hola mundo desde funciones de firebase"
  });
});

export const getGOTY = functions.https.onRequest( async (request, response) => {

  const GOTY_REF = db.collection('goty');
  const DOCS_SNAP = await GOTY_REF.get();
  const JUEGOS = DOCS_SNAP.docs.map( doc => doc.data() );

  response.json( JUEGOS );

});

//Express

const app = express();
app.use( cors({ origin: true }) );

app.get('/goty', async ( req,res ) => {

  const GOTY_REF = db.collection('goty');
  const DOCS_SNAP = await GOTY_REF.get();
  const JUEGOS = DOCS_SNAP.docs.map( doc => doc.data() );

  res.json( JUEGOS );

} );

app.post('/goty/:id', async ( req,res ) => {

  const { id } = req.params;
  const gameRef = db.collection('goty').doc( id );
  const gameSnap = await gameRef.get();

  if(!gameSnap.exists){

    res.status(404).json({
      ok: false,
      mensaje: `No existe un juego con el siguiente ID ${ id } `
    })

  } else {

    const antes = gameSnap.data() || { votos: 0 };

    await gameRef.update({
      votos: antes.votos +1
    })

    res.json({
      ok: true,
      mensaje: `Gracias por tu voto a ${ antes.name }`
    })

  }

} );

export const api = functions.https.onRequest( app );