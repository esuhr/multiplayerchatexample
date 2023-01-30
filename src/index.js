import * as pixi from 'pixi.js';
const socket = io();
const roomContainer = document.getElementById('room');
const c = document.getElementById('canvas');
const bunny = pixi.Texture.from('/assets/bunny.png');
const sky = pixi.Texture.from('assets/sky.png')
const stage = new pixi.Container()
const app = new pixi.Application({
    width: window.innerWidth - 300,
    height: window.innerHeight,
    backgroundColor: 0xF7DC6F,
    autoResize: true
});





var Player = function(initPack) {
    var self = {};
    self.id = initPack.id;
    self.username = initPack.username;
    self.x = initPack.x;
    self.y = initPack.y;
    self.sprite = new pixi.Sprite(bunny);
    self.sprite.id = self.id;
    Player.list[self.id] = self;
    return self;
}

Player.list = {};
var selfId = null;

socket.on('init', (data) => {
    if(data.selfId) {
        selfId = data.selfId;
    };
    for(var i = 0; i < data.player.length; i++) {
        new Player(data.player[i]);
    };
});

socket.on('update', (data) => {
    // console.log('the data', data)
    for(var i = 0; i < data.player.length; i++) {
        var pack = data.player[i];
        // var chatText = new pixi.Text(pack.chat)
        // stage.addChild(chatText)
        var p = Player.list[pack.id];
        // console.log('the player list', Player.list)

        if(p) {
            stage.addChild(p.sprite)
            if(pack.x !== undefined) {
                p.x = pack.x;
                p.sprite.x = pack.x;
            };
            if(pack.y !== undefined) {
                p.y = pack.y;
                p.sprite.y = pack.y;
            };
        };

    };

});

app.stage.addChild(stage);
c.appendChild(app.view);



socket.on('remove', (data) => {
    for(var i = 0; i < data.player.length; i++) {
        delete Player.list[data.player[i]];
    }
})


// login
const loginContainer = document.getElementById('login-container');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');

loginButton.onclick = () => {
    socket.emit('login', {
        username: loginUsername.value,
        // password: loginPassword.value,
    });
}

socket.on('loginRes', (data) => {
    if(data.success) {
        loginContainer.style.display = 'none';
        roomContainer.style.display = 'flex';
    }
});


// chat 
const chatText = document.getElementById('chat-text');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');

socket.on('addChat', (data) => {
    chatText.innerHTML += '<div style="margin-left: 10px; margin-top: 3px;">' + data + '</div>';
    scrollBottom();
})

chatForm.onsubmit = (e) => {
    e.preventDefault();
    socket.emit('msgChat', chatInput.value);
    console.log(chatInput.value);
    chatInput.value = '';
}

function scrollBottom() {
    chatText.scrollTop = chatText.scrollHeight;
}

// utils
window.addEventListener('resize', onResize);

function onResize() {
    app.renderer.resize((window.innerWidth - 300), window.innerHeight);
}

window.onkeydown = (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            socket.emit('keyPress', {inputType: 'left', state: true});
            break;
        case 'ArrowRight':
            socket.emit('keyPress', {inputType: 'right', state: true});
            break;
        case 'ArrowUp':
            socket.emit('keyPress', {inputType: 'up', state: true});
            break;
        case 'ArrowDown':
            socket.emit('keyPress', {inputType: 'down', state: true});
            break;
    };
};

window.onkeyup = (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            socket.emit('keyPress', {inputType: 'left', state: false});
            break;
        case 'ArrowRight':
            socket.emit('keyPress', {inputType: 'right', state: false});
            break;
        case 'ArrowUp':
            socket.emit('keyPress', {inputType: 'up', state: false});
            break;
        case 'ArrowDown':
            socket.emit('keyPress', {inputType: 'down', state: false});
            break;
    };
};