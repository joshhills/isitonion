/*
 * Provide interpolation
 * with RTDB via configuration
 * from Google documentation.
 *
 * @name    firebase
 * @author  mod_ave
 * @version 0.1
 */

/* User variables used for authentication. */

var isSignedIn = false;

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAvnS8sxsosVUAz9cXsvqC9RE1yt4OrGt4",
    authDomain: "isitonion.firebaseapp.com",
    databaseURL: "https://isitonion.firebaseio.com",
    storageBucket: "isitonion.appspot.com",
};
firebase.initializeApp(config);
// Get a reference to the database service
var database = firebase.database();

// Sign the user in anonymously.
firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    console.log("A firebase error occured:"
            + "\nCode: " + error.code
            + "\nMessage: " + error.message);
});

// Reguster a listener for sign changes.
firebase.auth().onAuthStateChanged(function(user) {
  isSignedIn = user ? true : false;
});