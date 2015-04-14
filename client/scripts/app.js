var App = function(username){
  this.username = username;
  this.people = {};
  this.rooms = {};
  this.roomname = null;
  this.messages = {};
}

App.prototype.init = function(username){
  this.username = username;
  this.fetch();
 setInterval(this.fetch.bind(this),1000)
}

App.prototype.fetch = function(){
  var instance = this;
  var messages = this.messages;
  var rooms = this.rooms;
  $.ajax({
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'GET',
    contentType: 'application/json',
    // data : {
    //   "order" : '-createdAt'
    // },
    success: function (data) {
      for (var i = 0; i < data.results.length; i++){
        var key = (jsesc(data.results[i].username)
         + (data.results[i].updatedAt)) || null;
        if (!messages[key]){
          var tempObj = {
            "roomname" : jsesc(data.results[i].roomname),
            "text" : jsesc(data.results[i].text),
            "username" : jsesc(data.results[i].username),
            "updatedAt" : jsesc(data.results[i].updatedAt)
          }
          messages[key] = tempObj;
        }
      }
      instance.updateScreen();
    },
    error: function (data) {
      console.error('chatterbox: Failed to retrieve message');
    }
  });
}

// jsesc(,{'escapeEverything': true});

App.prototype.updateScreen = function(){
  this.updateRooms();
  this.displayMessages();
  this.updatePeople();
}

App.prototype.displayMessages = function(){
  $(".message").remove();
  for(var key in this.messages){
    if(this.messages[key].roomname === this.roomname){
      if(this.people[this.messages[key].username]){
        console.log('friend message');

        $(".messageContainer").append('<a class=\"message friend\"> From:'+this.messages[key].username+'<br />'
          +'@: '+this.messages[key].updatedAt+'<br />'
          +this.messages[key].text+'</a>');
      }
      else{
        $(".messageContainer").append('<a class=\"message\"> From:'+this.messages[key].username+'<br />'
          +'@: '+this.messages[key].updatedAt+'<br />'
          +this.messages[key].text+'</a>');
      }
    }
  }
}

App.prototype.updateRooms = function(){
  for(var key in this.messages){
    if(!this.rooms[this.messages[key].roomname]){
      this.rooms[this.messages[key].roomname]=1;
    }
    else{
      this.rooms[this.messages[key].roomname]++;
    }
  }
  this.updateRoomSelector();
}

App.prototype.updateRoomSelector = function(){
  // $(".roomname").remove();
  var instance = this;
  var displayedRooms = {};
  $(".roomname").each(function(){
    if (!instance.rooms[$(this).text()]){
      $(this).remove();
    }
    else{
      displayedRooms[$(this).text()] = true;
    }
  })

  for(var room in this.rooms){
    if (!displayedRooms[room]){
      $('#roomSelector').append('<option class=\"roomname\">'
        +room+'</option>');
    }
  }
  $("#roomSelector").val(this.roomname);
}

App.prototype.send = function(message){
  //construct object to send as message
  var messageObject = {
    'roomname' : this.roomname,
    'text' : message,
    'username' : this.username
  }
  console.log(JSON.stringify(messageObject));
  $.ajax({
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'POST',
    data: JSON.stringify(messageObject),
    contentType: 'application/json',
    success: function (data) {
      console.log(data);
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
    console.error('chatterbox: Failed to send message');
    }
  });
}

App.prototype.createRoom = function(newRoom){
  if (!this.rooms[newRoom]){
    this.rooms[newRoom] = 1;
    this.roomname = newRoom;
    this.updateRooms();
  }
}

App.prototype.updatePeople = function(){
  for (var key in this.messages){
    if (this.people[this.messages[key].username] === undefined){
      this.people[this.messages[key].username] = false;
    }
  }
  this.displayPeople();
}

App.prototype.displayPeople = function(){
  var instance = this;
  $(".person").remove();
  for(var key in this.people){
    if(!this.people[key]){
      $("#peopleContainer").append('<button class=\"person\">' + key + '</button>');
    }else{
      $("#peopleContainer").append('<button class=\"person friend\">' + key + '</button>');
    }
  }
 $(".person").click(function() {
    instance.makeFriend($(this).text());
  });
}

App.prototype.makeFriend = function(friend){
  if(this.people[friend] !== undefined){
    this.people[friend] = true;
  }
}






