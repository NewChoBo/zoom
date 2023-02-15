import http from "http";
import {Server} from "socket.io";
import { instrument } from "@socket.io/admin-ui";
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
const wsServer = new Server(httpServer, {
    //데모가 작동하는데 필요한 환경설정
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    }
});        
// const wsServer = SocketIO(httpServer);        
instrument(wsServer, {
    auth: false,
    mode: "development",
  });


//publicRooms만 골라낸다. (socket id 걸러내기)
function publicRooms(){
    const {
        sockets: {
            adapter: {sids, rooms },
        },
    } = wsServer;      //이 문법은 많이 낯설다.
    // const sids = wsServer.sockets.adapter.sids;
    // const rooms = wsServer.sockets.adapter.rooms;

    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    })
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

//connection 받을 준비 끝
wsServer.on("connection", (socket) => {
    console.log(wsServer.sockets.adapter);
    socket["nickname"] = "Anon";

    socket.onAny((event) => {
        console.log(`Socket Event:${event}`);
        // console.log(`You are in room : ${JSON.stringify(socket.rooms)}`);    //이건 아닌가봄.
    })

    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());    //서버의 모든 소켓에 public 방들에 대한 정보를 payload로 보낸다.
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach(
            room => socket.to(room).emit("bye", socket.nickname, countRoom(room) -1)
        );
        wsServer.sockets.emit("room_change", publicRooms()); 
        //브라우저를 끄지 않고 새로고침만 하면, 바로 소켓이 사라지지 않는걸까
        //가 아니라 한발 늦게 반응함. disconnected된게 아니라, disconnecting. 완전 사라지지 않았기 때문인듯.
    });

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms()); 
    });

    socket.on("new_message", (msg, roomName, done) => {
        socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });

    socket.on("nickname", nickname => socket["nickname"] = nickname);
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

