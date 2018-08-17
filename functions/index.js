const functions = require('firebase-functions');
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});
const fs = require('fs');
const UUID = require('uuid-v4')
const gcconfig = {
  projectId: "reactnativeapp-6d6da",
  keyFilename: "reactnativeapp-6d6da-firebase-adminsdk-t1wy3-62150a23bf.json"
}
const gcs = require('@google-cloud/storage')(gcconfig);

admin.initialzeApp({
  credential: admin.credential.cert(require("./awesome-places.json"))
});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.storeImage = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    if(!request.headers.authorization ||
        !request.headers.authorization.startsWith("Bearer ")) {
          console.log("No Token Present!");
          response.state(403).json({error: "Unathorized"});
          return;
    }
    let idToken;
    idToken = request.headers.authorization.split("Bearer ")[1];
    admin.auth().verifyIdToken(idToken)
      .then(decodedToken => {
        const body = JSON.parse(request.body);
        fs.writeFileSync("/tmp/uploaded-image.jpg", body.image, "base64", err => {
          return response.status(500).json({ error: err });
        });
        const bucket = gcs.bucket("reactnativeapp-6d6da.appspot.com");
        const uuid = UUID();
        return bucket.upload(
          "/tmp/uploaded-image.jpg",
          {
            uploadType: "media",
            destination: "/places/" + uuid + ".jpg",
            metadata: {
              metadata: {
                contentType: "image/jpeg",
                firebaseStorageDownloadTokens: uuid
              }
            }
          },
          (err, file) => {
            if (!err) {
              return response.status(201).json({
                imageUrl:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(file.name) +
                  "?alt=media&token=" +
                  uuid
              });
            } else {
              console.log(err);
              return response.status(500).json({ error: err });
            }
          }
        );
      })
      .catch(error => {
        console.log('Token is invalid!');
        response.state(500).json({error: err});
      });
  });
});
