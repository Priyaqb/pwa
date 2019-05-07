var deferredPrompt;
var closeLength;
var close = [];
var listId = 0;


if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() {
            console.log('Service worker is registered');
        });
}

window.addEventListener("beforeinstallprompt", function(event) {
    console.log("beforeinstallprompt triggered");
    event.preventDefault();
    deferredPrompt = event;
    return false;
})

var form = document.querySelector('form'),
    toDoInput = document.querySelector('#toDo');


var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    myNodelist[i].appendChild(span);
}



// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
    }
}, false);

function deleteData() {
  /*var postArray = [post]
  fetch('https://us-central1-pwademo-8da90.cloudfunctions.net/removeListData', {
          method: 'POST',
          mode: "cors",
          cache: "no-cache",
        
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify(post)
    })*/
}


// Create a new list item when clicking on the "Add" button
function newElement(data) {
    //listId ++;
    var li = document.createElement("li");
    var inputValue = data.description;
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    document.getElementById("myUL").appendChild(li);
    document.getElementById("toDo").value = "";
    //var listLength = document.getElementById("myUL").getElementsByTagName("li").length;
    //listI

    // var span = document.createElement("SPAN");
    // var txt = document.createTextNode("\u00D7");
    // span.className = "close";
    // span.id = data.key;
    // span.appendChild(txt);
    // li.appendChild(span);

    // var key =  document.createElement("SPAN");
    // var txt = data.id;
    // key.style.display = "none";

    // Click on a close button to hide the current list item
    
    // close = document.getElementsByClassName("close");
    // for (closeLength = 0; closeLength < close.length; closeLength++) {
    //     close[closeLength].onclick = function() {
    //         var div = this.parentElement;
    //         div.style.display = "none";
    //         var keyValue = this.id;

    //         var post = {
    //           key: keyValue
    //         };

    //         if ('serviceWorker' in navigator && 'SyncManager' in window) {
    //           navigator.serviceWorker.ready
    //             .then(function(sw) {
    //               writeData('sync-delete-posts', post)
    //                 .then(function() {
    //                   console.log("writinggggg")
    //                   return sw.sync.register('sync-new-delete-posts');
    //                 })
    //                 .catch(function(err) {
    //                   console.log(err);
    //                 });
    //             });
    //         } else {
    //           deleteData(key);
    //         }
    //     }
    // }
}

function addElement() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choiceResult) {
            console.log(choiceResult.outcome);
            if (choiceResult.outcome === "dismissed") {
                console.log("User dismissed")
            } else {
                console.log("User added to homescreen")
            }
        })
        deferredPrompt = null;
    }
}


function updateUI(data) {
    //clearCards();
    for (var i = 0; i < data.length; i++) {
        newElement(data[i]);
    }
}

var url = 'https://pwademo-8da90.firebaseio.com/lists.json';
var networkDataReceived = false;

fetch(url)
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        networkDataReceived = true;
        console.log('From web', data);
        var dataArray = [];
        for (var key in data) {
            dataArray.push(data[key]);
        }
        document.getElementById("myUL").innerHTML = "";
        updateUI(dataArray);
    });

if ('indexedDB' in window) {
    readAllData('lists')
        .then(function(data) {
            if (!networkDataReceived) {
                console.log('From cache', data);
                updateUI(data);
            }
        });
}


function sendData(post) {
  var postArray= [post]
  fetch('https://us-central1-pwademo-8da90.cloudfunctions.net/storeListData', {
          method: 'POST',
          mode: "cors",
          cache: "no-cache",
        
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify(post)
    })
    .then(function(res) {
      updateUI(postArray)
    })
}

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

form.addEventListener('submit', function(event) {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choiceResult) {
            console.log(choiceResult.outcome);
            if (choiceResult.outcome === "dismissed") {
                console.log("User dismissed")
            } else {
                console.log("User added to homescreen")
            }
        })
        deferredPrompt = null;
    }

    event.preventDefault();

    if (toDoInput.value.trim() === '') {
        alert('Please enter valid data!');
        return;
    }

    var post = {
      id: guidGenerator(),
      description: toDo.value
    };

    

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      var postArray= [post]
      updateUI(postArray)
      navigator.serviceWorker.ready
        .then(function(sw) {
          writeData('sync-posts', post)
            .then(function() {
              console.log("writinggggg")
              return sw.sync.register('sync-new-posts');
            })
            .catch(function(err) {
              console.log(err);
            });
        });
    } else {
      sendData(post);
    }
});