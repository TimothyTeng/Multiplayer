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
        onCooldown:false,
        EntityType:type,
    }
    if(self.EntityType === "Item"){
        Item.list[self.id] = self;
    }
    else if(self.EntityType === "FireAbility"){
        FireAbilities.list[self.id] = self;
    }

    self.checkCooldown = async function(duration) {
        console.log("Cooldown duration:", duration);
        self.onCooldown = true;
    
        await new Promise(resolve => {
            setTimeout(() => {
                self.onCooldown = false;
                console.log("Cooldown finished. onCooldown set to false.");
                resolve();
            }, duration * 1000);
        });
    };
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
            self.socket.emit('updateAbilities', self.items);
            return;
        }
        //client only
        var inventory = document.getElementById("abilities")
        inventory.innerHTML = "";
        var addButton = function(data){
            let item = FireAbilities.list[data.id]
            let button = document.createElement('button');
            button.onclick = function(){
                self.socket.emit("useAbility", item.id);
            }
            button.innerText = item.name + " x" + data.amount
            inventory.appendChild(button);
        }
        for(var i=0 ; i<self.items.length; i++){
            addButton(self.items[i]);
        }
    }
    if(self.server){
        socket.on("useAbility", function(itemId){
            let item = FireAbilities.list[itemId]
            if(item.onCooldown){
                return
            }
            else{
                item.event(Player.list[self.socket.id]);
                item.onCooldown = true
                item.checkCooldown(item.cooldown)
            }
        })
    }

    return self
}
FireAbilities.list = {}

Item("potion", "Potion", function(player){
    player.hp = 10;
    player.inventory.removeItem('potion', 1);
}, 0, "Item")

Item("superAttack", "Super Attack", function(player){
    for(var i=0; i<360; i++)
        player.shootBullet(i)
}, 10, "FireAbility")

/* Item("fireWall", "Fire Wall", function(player){
    for(var i=0; i<120; i++)
        player.shootBullet(player.mouseAngle-(120/2)+i)
}, 5) */

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
}, 5, "FireAbility")


