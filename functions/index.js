var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwademo-key.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://pwademo-8da90.firebaseio.com/'
})

// Push new item

exports.storeListData = functions.https.onRequest((request, response) => {
 cors(request, response, function(){
 	admin.database().ref("lists").push({
 		id: request.body.id,
 		description: request.body.description
 	})
 		.then(function(res){
 			response.status(201).json({message:"Data Stored", id:request.body.id, key:res.getKey()})
 		})
 		.catch(function(err){
 			response.status(500).json({error: err})
 		})
 })
});

// Delete an item

exports.removeListData = functions.https.onRequest((request, response) => {
 cors(request, response, function(){
 	var listRef = admin.database().child("lists");
	var query = listRef.orderByChild("id").equalTo(2);
	query.once("value", function(snapshot) {
	   snapshot.forEach(function(itemSnapshot) {
	       itemSnapshot.ref.remove();
	   }); 
	});
	// console.log(request.body.id,"-------------")
 // 	admin.database().ref("lists").splice( request.body.id, 1 )
 // 		.then(function(){
 // 			response.status(201).json({message:"Deleted Data"})
 // 		})
 // 		.catch(function(err){
 // 			response.status(500).json({error: err})
 // 		})
 })
});
