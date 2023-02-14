import http from "http";
import SocketIO from "socket.io";
import express from "express";
// import express, { application } from "express";
// import { Socket } from "dgram";
// import WebSocketServer from "ws";
// import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.render("home"));


//웹소켓
// const server = http.createServer(app);
// const wss = new WebSocketServer.Server({ server });
// const wss = new WebSocket.Server({ server });


//socketIO
// const server = http.createServer(app);
const httpServer = http.createServer(app);      //이름은 자유
const wsServer = SocketIO(httpServer);        

//connection 받을 준비 끝
wsServer.on("connection", (socket) => {
    socket.on("enter_room", (msg, done) => {
        console.log(msg);
        setTimeout(() => {
            done();
        }, 10000);        
    });
});



//기존 웹소켓 활용 코드
/*
const wss = new WebSocket.Server({ server });
const sockets = [];

//web socket도 event가 있다.
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";

    //클라이언트랑 연결이 끊기면 동작
    socket.on("close", () => {console.log("Disconnected from the Browser 😡");});
    // socket.on("close", onSocketClose);

    //클라이언트에게서 메세지 받음
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);

        switch (message.type){
            case "new_message":
                //그냥 바꿔봤는데 되네...?
                sockets.forEach(aSocket => {aSocket === socket ? {} : aSocket.send(`${socket.nickname} : ${message.payload}`)});
                break;
            case "nickname":
                // console.log(message.payload);
                socket["nickname"] = message.payload;
                break;
        }
    });

    //클라이언트에게 메세지 전송
    // socket.send("hello!!!");

    console.log("Connected to Browser ✔");
});
*/

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);      //포트번호, 함수 실행

