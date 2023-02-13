// const aWebSocket = new WebSocket("http://localhost:3000/");      //웹소켓이기때문에 http 아님
// const aWebSocket = new WebSocket("ws://localhost:3000/");

//window.location, window.location.host 명령어를 통해 사용자의 현재 주소를 알 수 있다.
//app.js의 socket은 서버로의 연결을 의미한다.
const socket = new WebSocket(`ws://${window.location.host}`);  



