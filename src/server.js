import http from "http";
import express, { application } from "express";
// import WebSocketServer from "ws";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
// app.get("/*", (req, res) => res.render("/"));
app.get("/*", (req, res) => res.render("home"));

const handleListen = () => console.log('Listening on http://localhost:3000');
// app.listen(3000, handleListen);

const server = http.createServer(app);
// const wss = new WebSocketServer.Server({ server });
const wss = new WebSocket.Server({ server });


//익명함수 안쓰고 꺼내서 쓴다면
function onSocketClose() {
    console.log("Disconnected from the Browser 😡");
}
function onSocketMessege(message) {
    console.log(message.toString('utf-8'));
}


//web socket도 event가 있다.
wss.on("connection", (socket) => {
    // console.log(socket);

    //클라이언트랑 연결이 끊기면 동작
    // socket.on("close", () => {console.log("Disconnected from the Browser 😡");});
    socket.on("close", onSocketClose);

    //클라이언트에게서 메세지 받음
    // socket.on("message", (message) => {
    //     console.log(message.toString('utf-8'));
    // });
    socket.on("message", onSocketMessege);      //익명함수때는 인자로 message를 써주는데... 필요없나? JAVA랑은 달라서 그런가?

    //클라이언트에게 메세지 전송
    socket.send("hello!!!");


    console.log("Connected to Browser ✔");
});

server.listen(3000, handleListen);      //포트번호, 함수 실행