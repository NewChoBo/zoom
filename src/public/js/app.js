const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras(){
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        // console.log(devices);        //겁나 많이 나옴
        const cameras = devices.filter(device => device.kind === "videoinput");
        // console.log(cameras);
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            camerasSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}

async function getMedia(){
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
        }); //인자로는 constraints를 보냄. constraints는 기본적으로 우리가 얻고싶은것
        // console.log(myStream);
        myFace.srcObject = myStream;

        await getCameras();
    } catch(e){
        console.log(e);
    }
}

getMedia();

//음소거 여부를 추적할 수 있는 variable이 필요.
function handleMuteClick (){
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
function handleCameraClick (){
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
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);