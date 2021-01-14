const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.database
  .ref("/users/{userId}/baby/{babyId}/Data")
  .onUpdate((change, context) => {
    const data = change.after.val();
    console.log("Message received");
    const { SpO2, bpm, temp } = data;
    const warnnings = [];
    if (SpO2 > 8) warnnings.push("High oxygen level");
    if (bpm > 8) warnnings.push("High pulse level");
    if (temp > 8) warnnings.push("High tempreture level");

    if (warnnings.length == 0) return;

    const payLoad = {
      notification: {
        title: "Warning",
        body: warnnings.join(" and"),
        sound: "default",
      },
    };

    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 2,
    };

    return admin
      .database()
      .ref(`/users/${context.params.userId}/notificationToken`)
      .once("value")
      .then((res) => {
        const deviceToken = res.val();
        return admin.messaging().sendToDevice(deviceToken, payLoad, options);
      });
  });
