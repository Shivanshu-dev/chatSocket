const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");

// get username and room from url

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log(username, room);

const socket = io();

socket.emit("JoinRoom", { username, room });

// get users and room info

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// msg from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// client submit message
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // get user input text
  const msg = e.target.elements.msg.value;

  // send msg to server

  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// dom manupulation for message
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `	<p class="meta">${message.username} <span>${message.time}</span></p>
<p class="text">
 ${message.text}
</p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// output room names to dom

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  usersList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
