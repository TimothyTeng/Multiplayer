//Entity({x:"20"}) example of overiding

var initPack = {player:[], bullet:[]};
var removePack = {player:[], bullet:[]};

Entity = function(param){
    var self = {
        x:500,
        y:300,
        spdX:0,
        spdY:0,
        id:"",
        map:'forest'
    }
    if(param){
        if(param.x)
            self.x = param.x
        if(param.y)
            self.y = param.y
        if(param.map)
            self.map = param.map
        if(param.id)
            self.id = param.id
    }

    self.update = function(){
        self.updatePosition();
    }
    self.updatePosition = function(){
        self.x += self.spdX
        self.y += self.spdY
    }
    self.getDistance = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2)); //find the distance between the entity and their point
    }
    return self
}
Entity.getFrameUpdateData = function(){
    var pack = {
        initPack:{
            player:initPack.player,
            bullet:initPack.bullet,
        },
        removePack:{
            player:removePack.player,
            bullet:removePack.bullet,
        },
        updatePack:{
            player:Player.update(),
            bullet:Bullet.update(),
        }
    }
    initPack.player = [];
    initPack.bullet = [];
    removePack.player = [];
    removePack.bullet = [];

    return pack;
}

/* async function onCooldown(duration){
    if(duration===null){
        return 0
    }
    setInterval(function(){
        duration = duration-1
        if(duration === 0){
            return(duration)
        }
    }, 1000)
    return duration 
} */


Player = function(param){ //created a class called player
    var self = Entity(param);
    self.number = "" + Math.floor(10*Math.random());
    self.username = param.username;
    self.pressingRight = false; //checks if the client is pressing right left up or down
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.pressingAbility1 = false;
    self.pressingAbility2 = false;
    self.pressingAbility3 = false;
    self.mouseAngle = 0; //what angle the client is facing
    self.defaultAttackSpeed = 80;
    self.attackSpeed = self.defaultAttackSpeed;
    self.maxSpd = 10; //how many pixels the player moves
    self.hp = 10;
    self.hpMax = 10;
    self.score = 0;
    self.inventory = new Inventory(param.progress.items, param.socket, true);
    self.character = new FireAbilities([], param.socket, true);
    self.socket = param.socket;

    var super_update = self.update;
    self.update = function(){
        self.updateSpd();
        super_update();
        if(self.pressingAttack && self.attackSpeed === 100){
            self.shootBullet(self.mouseAngle); //if the mouse is clicked shoot bullets at that angle
            self.attackSpeed = self.defaultAttackSpeed
        }
        else if(self.pressingAttack && self.attackSpeed !== 100){
            self.attackSpeed += 5
        }
        if(self.pressingAbility1){
            let item = FireAbilities.list[self.character.items[0].id]
            if(onCooldown1===false){
                item.event(self);
                onCooldown1 = true
                endCooldown1(FireAbilities.list[self.character.items[0].id].cooldown*1000)
                self.socket.emit("Ability1Cooldown", {time:FireAbilities.list[self.character.items[0].id].cooldown*1000})
            }
        }
        if(self.pressingAbility2){
            let item = FireAbilities.list[self.character.items[1].id]
            if(onCooldown2===false){
                item.event(self);
                onCooldown2 = true
                endCooldown2(FireAbilities.list[self.character.items[1].id].cooldown*1000)
                self.socket.emit("Ability2Cooldown", {time:FireAbilities.list[self.character.items[1].id].cooldown*1000})
            }
        }
        if(self.pressingAbility3){
            let item = FireAbilities.list[self.character.items[2].id]
            if(onCooldown3===false){
                item.event(self);
                onCooldown3 = true
                endCooldown3(FireAbilities.list[self.character.items[2].id].cooldown*1000)
                self.socket.emit("Ability3Cooldown", {time:FireAbilities.list[self.character.items[2].id].cooldown*1000})
            }
        }
    }
    self.shootBullet = function(angle){
        if(Math.random()<0.1){
            self.inventory.addItem("potion",1)
        }
        Bullet({
            parent:self.id, 
            angle:angle,
            x:self.x,
            y:self.y,
            map:self.map,
            attackId:"normal",
            speed: 30,
        }); //creates a bullet entity
    }

    self.updateSpd = function(){
        if(self.pressingRight)
            self.spdX = self.maxSpd //moves the character right at that speed
        else if(self.pressingLeft)
            self.spdX = -self.maxSpd //moves the character left at that speed
        else
            self.spdX = 0

        if(self.pressingUp)
            self.spdY = -self.maxSpd
        else if(self.pressingDown)
            self.spdY = self.maxSpd
        else
            self.spdY = 0
    }
    self.getInitPack = function(){
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            number: self.number,
            hp: self.hp,
            hpMax:self.hpMax,
            score:self.score,
            map:self.map,
        }//add attackSpeed if needed
    }
    self.getUpdatePack = function(){
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            hp: self.hp,
            score:self.score,
            map: self.map,
        }
    }

    Player.list[self.id] = self; //adds the player to the player list
    initPack.player.push(self.getInitPack())
    return self;
}
Player.list = {};

var onCooldown1 = false
function endCooldown1(time){
    onCooldown1 = true
    setTimeout(function() {
        onCooldown1 = false;
    }, time);
}
var onCooldown2 = false
function endCooldown2(time){
    onCooldown2 = true
    setTimeout(function() {
        onCooldown2 = false;
    }, time);
}

var onCooldown3 = false
function endCooldown3(time){
    onCooldown3 = true
    setTimeout(function() {
        onCooldown3 = false;
    }, time);
}

Player.onConnect = function(socket, username, progress){
    var map = 'forest';
    if (Math.random()<0.5){
        map = 'field'
    }
    
    var player = Player({
        username: username,
        id:socket.id,
        map:map,
        socket:socket,
        progress: progress,
    });
    player.inventory.refreshRender();
    player.character.initialise();
    player.character.refreshRender();

    socket.on('keyPress', function(data){ //collects the data from the key press
        if(data.inputId === 'left')
            player.pressingLeft = data.state; //state would be true or false based on the client
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
        else if(data.inputId === 'attack'){
            player.pressingAttack = data.state;
        }  
        else if(data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
        else if(data.inputId === 'ability1')
            player.pressingAbility1 = data.state;
        else if(data.inputId === 'ability2')
            player.pressingAbility2 = data.state;
        else if(data.inputId === 'ability3')
            player.pressingAbility3 = data.state;
    });

    socket.on('sendMsgToServer', function(data){
        for(var i in Player.list){
            Player.list[i].socket.emit("addToChat", player.username + ': ' + data)
        }
    });

    socket.on('sendPmToServer', function(data){ //data: {username, message}
        var recipientSocket = null;
        for(var i in Player.list)
            if(Player.list[i].username === data.username)
                recipientSocket = Player.list[i].socket

        if(recipientSocket === null){
            socket.emit('addToChat', "The player " + data.username + ' is not online')
        }
        else{
            recipientSocket.emit('addToChat', "From " + player.username + ': ' + data.message)
            socket.emit('addToChat', "To " + data.username + ': ' + data.message)
        }
    });

    socket.on('changeMap', function(data){
        if(player.map === 'field')
            player.map = 'forest';
        else    
            player.map = 'field';
    });

    socket.on('clientAbilityCooldown1', function(data){
        endCooldown1(data.time)
    })
    socket.on('clientAbilityCooldown2', function(data){
        endCooldown2(data.time)
    })
    socket.on('clientAbilityCooldown3', function(data){
        endCooldown3(data.time)
    })

    socket.emit('init', {
        selfId: socket.id,
        player: Player.getAllInitPack(),
        bullet: Bullet.getAllInitPack(),
    })
}

Player.getAllInitPack = function(){
    var players = []
    for(var i in Player.list){
        players.push(Player.list[i].getInitPack())
    }
    return players
}

Player.onDisconnect = function(socket){
    let player = Player.list[socket.id];
    if(!player)
        return;
    savePlayerProgress({
        username: player.username,
        items:player.inventory.items,
    })
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}

Player.update = function(){
    var pack = []; //store of all the users in the socket

    for (var i in Player.list){
        var player = Player.list[i];//goes through each person in the socket list
        player.update();
        pack.push(player.getUpdatePack())
    }
    return pack
}



Bullet = function(param){
    var self = Entity(param); //creates a subclass
    self.id = Math.random(); //makes each bullet unique
    self.angle = param.angle;
    self.speed = param.speed;
    self.spdX = Math.cos(param.angle/180*Math.PI)*self.speed;
    self.spdY = Math.sin(param.angle/180*Math.PI)*self.speed;
    self.parent = param.parent; // sets the person which it comes from
    self.timer = 0
    self.damage = 1
    self.attackId = "normal"
    if(self.attackId){
        self.attackId = param.attackId
    }
    if(param.damage){
        self.damage = param.damage
    }
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        if(self.timer++ > 100)
            self.toRemove = true;
        super_update();
        for(var i in Player.list){
            var p = Player.list[i];
            if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id){
                p.hp -= self.damage
                if(p.hp <= 0){
                    var shooter = Player.list[self.parent];
                    if(shooter)
                        shooter.score += 1;
                    p.hp = p.hpMax
                    p.x = Math.random() * 500
                    p.y = Math.random() * 500
                }
                self.toRemove = true
            }
        }
    }
    self.getInitPack = function(){
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            map:self.map,
            attackId: self.attackId
        }
    }
    self.getUpdatePack = function(){
        return {
            id: self.id,
            x: self.x,
            y: self.y,
        }
    }

    Bullet.list[self.id] = self;

    initPack.bullet.push(self.getInitPack())
    return self;
}
Bullet.list = {};

Bullet.update = function(){
    var pack = []; //store of all the bullets in the socket

    for (var i in Bullet.list){
        var bullet = Bullet.list[i];//goes through each bullet in the socket list
        bullet.update();
        if(bullet.toRemove){
            delete Bullet.list[i]
            removePack.bullet.push(bullet.id);
        }
        else
            pack.push(bullet.getUpdatePack())
    }
    return pack
}

Bullet.getAllInitPack = function(){
    var bullets = []
    for(var i in Bullet.list){
        bullets.push(Bullet.list[i].getInitPack())
    }
    return bullets

}