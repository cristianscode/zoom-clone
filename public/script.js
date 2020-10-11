const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const userName = 'Cristian';
myVideo.className = 'col-4 p-2';
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443',
});

let myVideoStream;

// Promise for webcam and microphone
// Promise = a future event that will
// be resolved or rejected
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      video.className = 'col-4 p-2';
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });

    let text = $('input');

    $('html').keydown((e) => {
      if (e.which == 13 && text.val().length != 0) {
        console.log(text.val());
        socket.emit('message', text.val());
        text.val('');
      }
    });

    socket.on('createMessage', (message) => {
      console.log('Coming from server ', message);
      // var messages = document.getElementById('messages');
      // var msgElement = document.createElement('li');
      // msgElement.style.listStyle = 'none';
      // msgElement.innerHTML = message;
      // messages.appendChild(msgElement);

      // $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
      $('ul').append(
        `<li class="message"><b>${userName}</b><br/>${message}</li>`
      );
      scrollToBottom();
    });
  });

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  video.className = 'col-4 p-2';
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  console.log('scrolling to bottom');
  var d = $('.message_container');
  d.scrollTop(d.prop('scrollHeight'));
};

// Mute / Unmute

const unmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i> <label class="tool_label">Mute</label>`;
  document.querySelector('.mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i> <label class="tool_label">Unmute</label>`;
  document.querySelector('.mute_button').innerHTML = html;
};

// Stop Video
const stopVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setVideoOff();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setVideoOn();
  }
};

const setVideoOn = () => {
  const html = `<i class="fas fa-video"></i> <label class="tool_label">Stop Video</label>`;
  document.querySelector('.video_button').innerHTML = html;
};

const setVideoOff = () => {
  const html = `<i class="stopVideo fas fa-video-slash"></i> <label class="tool_label">Stop Video</label>`;
  document.querySelector('.video_button').innerHTML = html;
};
