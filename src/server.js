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

const sockets = [];

//web socket도 event가 있다.
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";

    //클라이언트랑 연결이 끊기면 동작
    // socket.on("close", () => {console.log("Disconnected from the Browser 😡");});
    socket.on("close", onSocketClose);

    //클라이언트에게서 메세지 받음
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);

        // if(message.type === "new_message"){
        //     sockets.forEach(aSocket => aSocket.send(message.payload));
        // } else if(message.type === "nickname"){
        //     console.log(message.payload);
        // }
        switch (message.type){
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload}`));
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

server.listen(3000, handleListen);      //포트번호, 함수 실행

