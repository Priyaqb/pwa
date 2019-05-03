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
 	// admin.database().ref("lists").push({
 	// 	id: request.body.id,
 	// 	description: request.body.description,
 	// 	key: ""
 	// })
 	// 	.then(function(res){
 	// 		admin.database().ref("lists")
 	// 			.update({ id: request.body.id, description: request.body.description, key: res.getKey() });
 	// 		response.status(201).json({message:"Data Stored", id:request.body.id, key:res.getKey()})
 	// 	})
 	// 	.catch(function(err){
 	// 		response.status(500).json({error: err})
 	// 	})
 	var postData = {
    id: request.body.id,
		description: request.body.description,
  };

  var newPostKey = admin.database().ref().child('lists').push().key;
  postData.key = newPostKey;

  var updates = {};
  updates['/lists/' + newPostKey] = postData;

  admin.database().ref().update(updates)
  	.then(function(res){
 			response.status(201).json({message:"Data Stored",key: newPostKey, id: request.body.id })
 		})
 		.catch(function(err){
 			response.status(500).json({error: err})
 		})

 })
});

// Delete an item

// exports.removeListData = functions.https.onRequest((request, response) => {
//  cors(request, response, function(){

//  		var removeData = admin.database().ref('lists');
// 	  removeData.child(request.body.key).remove()
// 	  	.then(function(res){
// 	 			response.status(201).json({message:"Data Deleted" })
// 	 		})
// 	 		.catch(function(err){
// 	 			response.status(500).json({error: err})
// 	 		})
// 	})
// });
