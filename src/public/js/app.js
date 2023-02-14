/* web socket으로 작업한 파일

// const aWebSocket = new WebSocket("http://localhost:3000/");      //웹소켓이기때문에 http 아님
// const aWebSocket = new WebSocket("ws://localhost:3000/");

//window.location, window.location.host 명령어를 통해 사용자의 현재 주소를 알 수 있다.
//app.js의 socket은 서버로의 연결을 의미한다.
//서버와 연결
// const socket = new WebSocket(`ws://${window.location.host}`);  

const messageList = document.querySelector("ul");
// const messageForm = document.querySelector("form");
const messageForm = document.querySelector("#message");     //id로 접근
const nickForm = document.querySelector("#nick");

//서버와 연결
const socket = new WebSocket(`ws://${window.location.host}`);  

function makeMessage(type, payload){
    const msg = {type, payload}
    return JSON.stringify(msg);
}

//서버와 연결되는 이벤트
socket.addEventListener("open", () => {
    console.log("Connected to Server ✔");
});

//서버에게 메세지를 받는 이벤트
socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;

    messageList.append(li);
});

//서버와 연결이 끊길때 이벤트
socket.addEventListener("close", () => {
    console.log("Disconnected from Server 😡");
});


function handleSubmit(event){
    event.preventDefault();     //기본 동작을 안하게 하나봄. 체크박스 체크하면 bool값이 reverse되는것을 막는다거나
    const input = messageForm.querySelector("input");

    // console.log(input.value);
    // socket.send(input.value);
    socket.send(makeMessage("new_message", input.value));

    //내가 보낸 메세지 화면에 그리기
    const li = document.createElement("li");
    li.innerText = `YOU : ${input.value}`;
    messageList.append(li);


    input.value = "";
}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    // socket.send(input.value);
    // socket.send(JSON.stringify({
    //     type:"nickname",
    //     payload:input.value,
    // }));
    socket.send(makeMessage("nickname", input.value));
    
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
*/

// socket.io
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(msg){
    console.log(`The backend says : ${msg}`);
}

function handleRoomSubmit (event) {
    event.preventDefault();
    const input = form.querySelector("input");

    //이젠 socket.send가 아님
    socket.emit(
        "enter_room", 
        { payload: input.value }, 
        backendDone,
    );   
    //항상 메세지를 보낼 필요없음. emit으로 오브젝트 보낼 수 있음.   
    //특정한 이벤트를 emit 할 수 있다. 어떤 이름이든 상관없음.
    //object를 보낼 수 있다. string 아니여도 됨.

    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);