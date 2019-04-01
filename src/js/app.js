var deferredPrompt;
var closeLength;
var close = [];


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

// Create a new list item when clicking on the "Add" button
function newElement(data) {
    var li = document.createElement("li");
    var inputValue = data.description;
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    document.getElementById("myUL").appendChild(li);
    document.getElementById("toDo").value = "";

    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    // Click on a close button to hide the current list item
    
    var t = new Date().toISOString();
    close = document.getElementsByClassName("close");
    for (closeLength = 0; closeLength < close.length; closeLength++) {
        close[closeLength].onclick = function() {
            var div = this.parentElement;
            var description = div.TextNode;
            var post = {
                id: closeLength - 1,
                description: description
            };
            div.style.display = "none";

            
            fetch('https://pwademo-4a910.firebaseio.com/lists/' + post, {
              method: 'delete',
              mode: "cors",
              cache: "no-cache"
            })

            /*
            .then(function(res) {
              console.log('Sent data', res);
              writeData('lists', post);
              readAllData('lists')
                .then(function(data) {
                    updateUI(data);
                });
              
            })*/
        }
    }
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

var url = 'https://pwademo-4a910.firebaseio.com/lists.json?t='+Math.random();
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


function sendData() {
    
  var post = {
      id: new Date().toISOString(),
      description: toDo.value
  };
  var postArray = [post]
  fetch('https://pwademo-4a910.firebaseio.com/lists.json', {
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

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(function(sw) {
          var post = {
            id: new Date().toISOString(),
            description: toDo.value
          };
          var postArray= [post]
          updateUI(postArray)
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
      sendData();
    }
});