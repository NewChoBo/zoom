import http from "http";
import express, { application } from "express";
// import WebSocketServer from "ws";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.render("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');
// app.listen(3000, handleListen);

const server = http.createServer(app);
// const wss = new WebSocketServer.Server({ server });
const wss = new WebSocket.Server({ server });

//server.js의 socket은 연결된 브라우저를 뜻한다.
function handleConnection(socket){
    console.log(socket);
}

//web socket도 event가 있다.
wss.on("connection", handleConnection);

server.listen(3000, handleListen);