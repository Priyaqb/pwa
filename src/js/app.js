var deferredPrompt;
var listArea = document.getElementById('myUL');
var form = document.querySelector('form');
var titleInput = document.querySelector('#titleInput');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('sw.js', {updateViaCache: 'none'}) 
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

var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
        var div = this.parentElement;
        div.style.display = "none";
    }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
    }
}, false);


// Show list items from firebase
function createCard(data) {
    var li = document.createElement("li");
    var inputValue = data.desc;
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    listArea.appendChild(li);
}

// Create a new list item when clicking on the "Add" button
function newElement() {

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

    var li = document.createElement("li");
    var inputValue = document.getElementById("titleInput").value;
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '') {
        alert("You must write something!");
    } else {
        document.getElementById("myUL").appendChild(li);
    }
    document.getElementById("titleInput").value = "";

    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    for (i = 0; i < close.length; i++) {
        close[i].onclick = function() {
            var div = this.parentElement;
            div.style.display = "none";
        }
    }
}
function clearCards() {
    while(listArea.hasChildNodes()) {
      listArea.removeChild(listArea.lastChild);
    }
  }

function updateUI(data) {
    //clearCards();
    for (var i = 0; i < data.length; i++) {
      createCard(data[i]);
    }
}
var url = 'https://todolist-4f5f3.firebaseio.com/list.json';
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
    updateUI(dataArray);
});


//update UI from cache
if ('indexedDB' in window) {
    readAllData('lists')
        .then(function(data){
            if(!networkDataReceived){
                console.log("From cache", data);
                updateUI(data);
            }
        })
}

function sendData() {
    fetch('https://todolist-4f5f3.firebaseio.com/list.json', {
        method: 'POST',
        headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            id: new Date().toISOString,
            desc: titleInput.value
        })
    })
    .then(function(res) {
        console.log('Sent Data');
        updateUI();
    })
}

form.addEventListener('submit', function(event){
    event.preventDefault();

    if (titleInput.value.trim() === "") {
        alert("You must write something!");
        return;
    }



    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(function(sw) {
            var post = {
              id: new Date().toISOString(),
              desc: titleInput.value
            };
            writeData('sync-lists', post)
              .then(function() {
                return sw.sync.register('sync-new-item');
              })
              .then(function() {
                console.log("List item saved for syncing");
              })
              .catch(function(err) {
                console.log(err);
              });
          });
      } else {
        sendData();
      }
})