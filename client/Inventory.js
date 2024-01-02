Inventory = function(items, socket, server){
    var self = {
        items:items,// {id:'ItemId', amount:1}
        socket:socket,
        server:server,
    }

    self.addItem = function(id, amount){
        for(var i=0; i<self.items.length;i++){
            if(self.items[i].id === id){
                self.items[i].amount += amount;
                self.refreshRender();
                return
            }
        }
        self.items.push({id:id, amount:amount})
        self.refreshRender();
    }

    self.removeItem = function(id, amount){
        for(var i=0 ; i<self.items.length; i++){
            if(self.items[i].id === id){
                self.items[i].amount -= amount;
                if(self.items[i].amount <= 0)
                    self.items.splice(i,1);
                self.refreshRender();
                return;
            }
        }
    }

    self.hasItem = function(id, amount){
        for(var i=0; i<self.items.length; i++){
            if(self.items[i].id === id){
                return self.items[i].amount >= amount;
            }
        }
        return false;
    }
    self.refreshRender = function(){
        //server
        if(self.server){
            self.socket.emit('updateInventory', self.items);
            return;
        }
        //client only
        var inventory = document.getElementById("inventory")
        inventory.innerHTML = "";
        var addButton = function(data){
            let item = Item.list[data.id]
            let button = document.createElement('button');
            button.onclick = function(){
                self.socket.emit("useItem", item.id);
            }
            console.log(item.name)
            button.innerText = item.name + " x" + data.amount
            inventory.appendChild(button);
        }
        for(var i=0 ; i<self.items.length; i++){
            addButton(self.items[i]);
        }
    }
    if(self.server){
        socket.on("useItem", function(itemId){
            if(!self.hasItem(itemId, 1)){
                console.log("Cheater");
                return
            }
            let item = Item.list[itemId]
            item.event(Player.list[self.socket.id]);
        })
    }

    return self;
}

Item = function(id, name, event, cooldown, type){
    var self = {
        id:id,
        name:name,
        event:event,
        cooldown:cooldown,
        EntityType:type,
    }
    if(self.EntityType === "Item"){
        Item.list[self.id] = self;
    }
    else if(self.EntityType === "Ability"){
        Abilities_list[self.id] = self;
    }

    return self;
}
Item.list = {};


FireAbilities = function(items, socket, server){
        var self ={
            items:items,// {id:'ItemId', amount:1}
            socket:socket,
            server:server,
        }
        self.initialise = function(){
            self.addItem("superAttack",1)
            self.addItem("fireWall",1)
            self.addItem("invincible", 1)
        }

    self.addItem = function(id, amount, item){
        for(var i=0; i<self.items.length;i++){
            if(self.items[i].id === id){
                self.items[i].amount += amount;
                self.refreshRender();
                return
            }
        }
        self.items.push({id:id, amount:amount, item:item})
        self.refreshRender();
    }

    self.removeItem = function(id, amount){
        for(var i=0 ; i<self.items.length; i++){
            if(self.items[i].id === id){
                self.items[i].amount -= amount;
                if(self.items[i].amount <= 0)
                    self.items.splice(i,1);
                self.refreshRender();
                return;
            }
        }
    }

    self.hasItem = function(id, amount){
        for(var i=0; i<self.items.length; i++){
            if(self.items[i].id === id){
                return self.items[i].amount >= amount;
            }
        }
        return false;
    }

    self.refreshRender = function(){
        //server
        if(self.server){
            self.socket.emit('updateAbilities', self.items);
            return;
        }
        //client only
        var inventory = document.getElementById("abilities")

        ability1 = document.getElementById("ability1")
        if(self.items[0]){
            ability1.innerText = self.items[0].id
        }

        ability2 = document.getElementById("ability2")
        if(self.items[1]){
            ability2.innerText = self.items[1].id
        }
        ability3 = document.getElementById("ability3")
        if(self.items[2]){
            ability3.innerText = self.items[2].id
        }
        ability1.onclick = function(){
            self.socket.emit("useAbility", Abilities_list[self.items[0].id].id);
            ability1.disabled = true;
            self.socket.emit("clientAbilityCooldown1", {time: Abilities_list[self.items[0].id].cooldown*1000})
            setTimeout(function(){
                ability1.disabled = false;
            }, Abilities_list[self.items[0].id].cooldown*1000)
        }
        ability2.onclick = function(){
            self.socket.emit("useAbility", Abilities_list[self.items[1].id].id);
            ability2.disabled = true;
            self.socket.emit("clientAbilityCooldown2", {time: Abilities_list[self.items[1].id].cooldown*1000})
            setTimeout(function(){
                ability2.disabled = false;
            }, Abilities_list[self.items[1].id].cooldown*1000)
        }

        ability3.onclick = function(){
            self.socket.emit("useAbility", Abilities_list[self.items[2].id].id);
            ability3.disabled = true;
            self.socket.emit("clientAbilityCooldown3", {time: Abilities_list[self.items[2].id].cooldown*1000})
            setTimeout(function(){
                ability3.disabled = false;
            }, Abilities_list[self.items[2].id].cooldown*1000)
        }
    }

    if(self.server){
        socket.on("useAbility", function(itemId){
            let item = Abilities_list[itemId]
            item.event(Player.list[self.socket.id]);
        })
    }

    return self
}


IceAbilities = function(items, socket, server){
    var self ={
        items:items,// {id:'ItemId', amount:1}
        socket:socket,
        server:server,
    }
    self.initialise = function(){
        self.addItem("iceBlink",1)
        self.addItem("freeze",1)
        self.addItem("invincible", 1)
    }

self.addItem = function(id, amount, item){
    for(var i=0; i<self.items.length;i++){
        if(self.items[i].id === id){
            self.items[i].amount += amount;
            self.refreshRender();
            return
        }
    }
    self.items.push({id:id, amount:amount, item:item})
    self.refreshRender();
}

self.removeItem = function(id, amount){
    for(var i=0 ; i<self.items.length; i++){
        if(self.items[i].id === id){
            self.items[i].amount -= amount;
            if(self.items[i].amount <= 0)
                self.items.splice(i,1);
            self.refreshRender();
            return;
        }
    }
}

self.hasItem = function(id, amount){
    for(var i=0; i<self.items.length; i++){
        if(self.items[i].id === id){
            return self.items[i].amount >= amount;
        }
    }
    return false;
}

self.refreshRender = function(){
    //server
    if(self.server){
        self.socket.emit('updateAbilities', self.items);
        return;
    }
    //client only
    var inventory = document.getElementById("abilities")

    ability1 = document.getElementById("ability1")
    if(self.items[0]){
        ability1.innerText = self.items[0].id
    }

    ability2 = document.getElementById("ability2")
    if(self.items[1]){
        ability2.innerText = self.items[1].id
    }
    ability3 = document.getElementById("ability3")
    if(self.items[2]){
        ability3.innerText = self.items[2].id
    }
    ability1.onclick = function(){
        self.socket.emit("useAbility", Abilities_list[self.items[0].id].id);
        ability1.disabled = true;
        self.socket.emit("clientAbilityCooldown1", {time: Abilities_list[self.items[0].id].cooldown*1000})
        setTimeout(function(){
            ability1.disabled = false;
        }, Abilities_list[self.items[0].id].cooldown*1000)
    }
    ability2.onclick = function(){
        self.socket.emit("useAbility", Abilities_list[self.items[1].id].id);
        ability2.disabled = true;
        self.socket.emit("clientAbilityCooldown2", {time: Abilities_list[self.items[1].id].cooldown*1000})
        setTimeout(function(){
            ability2.disabled = false;
        }, Abilities_list[self.items[1].id].cooldown*1000)
    }

    ability3.onclick = function(){
        self.socket.emit("useAbility", Abilities_list[self.items[2].id].id);
        ability3.disabled = true;
        self.socket.emit("clientAbilityCooldown3", {time: Abilities_list[self.items[2].id].cooldown*1000})
        setTimeout(function(){
            ability3.disabled = false;
        }, Abilities_list[self.items[2].id].cooldown*1000)
    }
}

if(self.server){
    socket.on("useAbility", function(itemId){
        let item = Abilities_list[itemId]
        item.event(Player.list[self.socket.id]);
    })
}

return self
}


Abilities_list = {}

Item("potion", "Potion", function(player){
    player.hp = 10;
    player.inventory.removeItem('potion', 1);
}, 0, "Item")

Item("superAttack", "Super Attack", function(player){
    for(var i=0; i<360; i++)
        player.shootBullet(i)
}, 10, "Ability")

Item("fireWall", "Fire Wall", function(player){
    Bullet({
        parent:player.id, 
        angle:player.mouseAngle,
        x:player.x,
        y:player.y,
        map:player.map,
        damage:5,
        attackId: "firewall",
        speed: 10
    });
}, 5, "Ability")

Item("invincible", "Invincible", function(player){
    prevHp = player.hp
    prevMaxHp = player.hpMax
    player.hp = 1000000
    player.hpMax = 1000000
    
    setTimeout(function(){
        player.hp = prevHp
        player.hpMax = prevMaxHp
    }, 3000)
}, 20, "Ability")


Item("iceBlink", "Ice Blink", function(player){
    angle = player.mouseAngle
    distance = 300
    player.x = player.x + Math.cos(angle/180*Math.PI)*distance;
    player.y = player.y + Math.sin(angle/180*Math.PI)*distance;
}, 2, "Ability")

Item("freeze", "Freeze", function(player){
    Bullet({
        parent:player.id, 
        angle:player.mouseAngle,
        x:player.x,
        y:player.y,
        map:player.map,
        damage:2,
        attackId: "freeze",
        speed: 30
    });
}, 10, "Ability")

