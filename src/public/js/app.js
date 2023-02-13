// const aWebSocket = new WebSocket("http://localhost:3000/");      //웹소켓이기때문에 http 아님
// const aWebSocket = new WebSocket("ws://localhost:3000/");

//window.location, window.location.host 명령어를 통해 사용자의 현재 주소를 알 수 있다.
//app.js의 socket은 서버로의 연결을 의미한다.
//서버와 연결
// const socket = new WebSocket(`ws://${window.location.host}`);  

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

//서버와 연결
const socket = new WebSocket(`ws://${window.location.host}`);  

//서버와 연결되는 이벤트
socket.addEventListener("open", () => {
    console.log("Connected to Server ✔");
});

//서버에게 메세지를 받는 이벤트
socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
});

//서버와 연결이 끊길때 이벤트
socket.addEventListener("close", () => {
    console.log("Disconnected from Server 😡");
});


function handleSubmit(event){
    event.preventDefault();     //기본 동작을 안하게 하나봄. 체크박스 체크하면 bool값이 reverse되는것을 막는다거나
    const input = messageForm.querySelector("input");

    // console.log(input.value);
    socket.send(input.value);
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);