const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        // console.log(devices);        //겁나 많이 나옴
        const cameras = devices.filter(device => device.kind === "videoinput");
        // console.log(cameras);
        const currentCamera = myStream.getVideoTracks()[0]; //어떤 카메라가 선택되었는지 알 수있다.?
        // console.log(myStream.getVideoTracks());
        //위 콘손의 label이 cameras의 label과 같다면 그 label은 선택된 것.

        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;

            if(currentCamera.label === currentCamera){    //같으면 selected
                option.selected = true;
            }

            camerasSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}

async function getMedia(deviceId){
    //initialConstraints는 deviceId가 없을 때 실행될 것. cameras 만들기 전
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    };
    //우리가 deviceid 갖고있을때
    const cameraConstraints = {
        audio: true,
        video: {
            deviceId: {
                exact: deviceId
            }
        }
    }

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            //diviceId가 있냐 없냐로 구분
            deviceId ? cameraConstraints : initialConstraints
        ); //인자로는 constraints를 보냄. constraints는 기본적으로 우리가 얻고싶은것
        // console.log(myStream);
        myFace.srcObject = myStream;

        if(!deviceId){
            await getCameras();
        }
        // await getCameras();
    } catch(e){
        console.log(e);
    }
}

// getMedia();  //시작

//음소거 여부를 추적할 수 있는 variable이 필요.
function handleMuteClick(){
    // console.log(myStream.getAudioTracks());
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));

    if(!muted){
        muteBtn.innerText = "Unmute"
    } else {
        muteBtn.innerText = "Mute"
    } 
    muted = !muted;    
}
function handleCameraClick(){
    console.log(myStream.getVideoTracks());
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));

    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
    } else {
        cameraBtn.innerText = "Turn Camera On";
    } cameraOff = !cameraOff;    
}
async function handleCameraChange(){
    // console.log(camerasSelect.value);
    await getMedia(camerasSelect.value);

    //카메라 설정을 바꿀 때 track을 바꿔야 함
    if(myPeerConnection){
        const vidoeTrack = myStream.getVideoTracks()[0];

        // console.log(myPeerConnection.getSenders()); //sender을 찾을 수 있다. 우린 그중에서도 video를 찾는 것.
        
        //우리는 카메라를 바꿀 때 stream을 통째로 바꿔버리는데, user에게 보내는 track은 바꾸지 않고있었다.
        //kind:"video"를 가진 Sender을 찾아서 getSender 할 것.
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind=="video");
        // console.log(videoSender);
        videoSender.replaceTrack(vidoeTrack);
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);



// Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    mackConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    
    // console.log(input.value);
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);



// Socket code
socket.on("welcome", async () => {
    // console.log("someone joined");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);    //이 코드는 기존에 입장해있던 사람에게서만 동작한다.
    // console.log(offer);

    console.log("sent the offer");
    socket.emit("offer", offer, roomName);    
});

socket.on("offer", async (offer) => {     //offer을 받은 쪽(신규 참가자)에게서 동작
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();   //여기서 생긴 answer로 setLocalDescription을 할 것.
    // console.log(answer);

    myPeerConnection.setLocalDescription(answer); 
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
});

socket.on("answer", answer => {
    console.log("received the answer");

    //로컬과 리모트?
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {   //ice event를 받아옴
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});


// RTC Code
function mackConnection(){
    myPeerConnection = new RTCPeerConnection();     //브라우저에 peer-to-peer 만듦
    //누군가가 getMedia 함수를 불렀을때 stream을 공유
    // console.log(myStream.getTracks());      //2개의 MediaStreamTrack을 가진 배열이 출력됨. audio, video

    myPeerConnection.addEventListener("icecandidate", handleIce);

    myPeerConnection.addEventListener("addstream", handleAddStream);

    myStream                                        //카메라와 마이크의 데이터 stream 받아 연결 안에 넣음
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));  //아직 브라우저들을 연결하진 않음. 따로 구성했을 뿐
}


function handleIce(data){   //ice event를 emit
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);   //브라우저끼리 candidate들을 서로 주고 받는다.
    // console.log("got ice candidate");
    // console.log(data);
}

function handleAddStream(data){
    const peerFace = document.getElementById("peerFace");
    // console.log("got an event from my peer");
    // console.log("Peer's Stream", data.stream);
    // console.log("My stream : ", myStream);

    peerFace.srcObject = data.stream;
}