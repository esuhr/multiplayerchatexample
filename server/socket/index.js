module.exports = (io) => {

    const socketList = {};

    const Entity = (param) => {
        const self = {
            id: "",
            x: 100,
            y: 100,
            spdX: 0,
            spdY: 0,
        }
        if(param) {
            if(param.id) {
                self.id = param.id;
            }
            if(param.x) {
                self.x = param.x;
            }
            if(param.y) {
                self.y = param.y;
            }
            if(param.id) {
                self.id = param.id;
            }
        }
        self.update = () => {
            self.updatePosition();
        }
        self.updatePosition = () => {
            self.x += self.spdX;
            self.y += self.spdY;
        }
        return self;
    }

    const Player = (param) => {
        const self = Entity(param);
        self.username = param.username;
        self.pressRight = false;
        self.pressLeft = false;
        self.pressUp = false;
        self.pressDown = false;
        self.spdMax = 10;
        self.chat = "";

        const updateAll = self.update;
        self.update = () => {
            self.updateSpd()
            updateAll();
        }

        self.updateSpd = () => {
            if(self.pressRight) {
                self.spdX = self.spdMax;
            } else if(self.pressLeft) {
                self.spdX = - self.spdMax;
            } else {
                self.spdX = 0;
            }
            if(self.pressDown) {
                self.spdY = self.spdMax;
            } else if(self.pressUp) {
                self.spdY = - self.spdMax;
            } else {
                self.spdY = 0;
            }
        }

        self.getInitPack = () => {
            return {
                id: self.id,
                username: self.username,
                x: self.x,
                y: self.y,
                chat: self.chat,
            };
        }
        self.getUpdatePack = () => {
            return {
                id: self.id,
                username: self.username,
                x: self.x,
                y: self.y,
                chat: self.chat
            }
        }
        Player.list[self.id] = self;
        initPack.player.push(self.getInitPack());
        return self;
    }

    Player.list = {};

    Player.onConnect = (socket, username) => {

        const player = Player({
            username: username,
            id: socket.id,
        });

        socket.on('keyPress', (data) => {
            switch(data.inputType) {
                case 'left':
                    player.pressLeft = data.state;
                    break;
                case 'right':
                    player.pressRight = data.state;
                    break;
                case 'up':
                    player.pressUp = data.state;
                    break;
                case 'down':
                    player.pressDown = data.state;
                    break;
            }
        });

        socket.on('msgChat', (data) => {
            player.chat = data;
            for(const i in socketList) {
                socketList[i].emit('addChat', player.username + ': ' + data);
            }
            console.log(player.username + ' sent message')
        });

        socket.emit('init', {
            selfId: socket.id,
            player: Player.getInitPackAll()
        })

    };

    Player.getInitPackAll = () => {
        const players = [];
        for(const i in Player.list) {
            players.push(Player.list[i].getInitPack());
        }
        return players;
    }

    Player.update = () => {
        const updatePack = [];
        for(const i in Player.list) {
            const player = Player.list[i];
            player.update();
            updatePack.push(player.getUpdatePack());
        }
        return updatePack;
    }

    Player.onDisconnect = (socket) => {
        delete Player.list[socket.id];
        removePack.player.push(socket.id);
    }
    
    const userList = {
        // username: password
    };

    io.on('connection', (socket) => {
        socket.id = Math.random();
        socketList[socket.id] = socket;
    
        socket.on('login', (data) => {
            Player.onConnect(socket, data.username);
            console.log(`${data.username} logged in on ${socket.id}`)
            socket.emit('loginRes', {success: true});
            // loginValid(data, (res) => {
            //     if(res) {
            //         Player.onConnect(socket, data.username);
            //         socket.emit('loginRes', {success: true});
            //         console.log(`${data.username} logged in on ${socket.id}`)
            //     } else {
            //         socket.emit('loginRes', {success:false});
            //     }
            // });
        });
    
        socket.on('disconnect', () => {
            console.log(socket.id + ' disconnected')
            delete socketList[socket.id];
            Player.onDisconnect(socket);
        });
    })
    
    const initPack = {player: []};
    const removePack = {player: []};
    
    setInterval(() => {
        const updatePack = {
            player: Player.update()
        };
    
        for(const i in socketList) {
            const socket = socketList[i];
            socket.emit('init', initPack);
            socket.emit('update', updatePack);
            socket.emit('remove', removePack);
        };
        initPack.player = [];
        removePack.player = [];
    
    }, 1000/60);

    function loginValid(data, callback) {
        callback(userList[data.username] === data.password)
    };
};