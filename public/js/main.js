const socket = io();
const chatForm = document.getElementById("chat-form"); // Updated to use the correct ID
const chatInput = document.getElementById("msg"); // Added to get the input field
const chatMessages = document.querySelector(".chat-messages");
const roomName= document.getElementById('room-name');
const userList= document.getElementById('users'); 
//Get username and room from URL
const {username, room}= Qs.parse(location.search, {
  ignoreQueryPrefix: true
})
//Join Chatroom
socket.emit('joinroom', {username, room})

//Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //Scroll down whenever get a message
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('roomusers',({room,users} )=>{
  outputRoomName(room);
  outputUsers(users);
})


// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //get message text
  const msg = chatInput.value;
  //emitting a message to server
  socket.emit("chatMessage", msg);
  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
//output message to dom so that we can render it on screen
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `	<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}
//aadd roomname to DOM
function outputRoomName(room){
  roomName.innerText=room;
}
//add users to DOM
function outputUsers(users){
  if (!Array.isArray(users)) {
      console.error('Users is not an array:', users);
      return;
  }
  userList.innerHTML= `
    ${users.map(user=>`<li>${user.username}</li>`).join('')}
  `;
} 