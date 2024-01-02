var mongojs = require("mongojs");
var db = mongojs('mongodb+srv://Timothy:6UowQMAZz4ce8cyN@gamedatabase.wsvnmwo.mongodb.net/?retryWrites=true&w=majority', ['account', 'progress'])

require('./Entity');
require('./client/Inventory');

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});
app.use('/client', express.static(__dirname+'/client'));

serv.listen(2000);
console.log("Server started")

var SOCKET_LIST = {};

var DEBUG =true;

var isValidPassword = function(data, cb){
    db.account.findOne({username:data.username, password:data.password}, function(err, res){
        if(res){
            cb(true);
        }
        else{
            cb(false);
        }
    })
}
var isUsernameTaken = function(data, cb){
    db.account.findOne({username:data.username}, function(err, res){
        if(res){
            cb(true);
        }
        else{
            cb(false);
        }
    })
}
var addUser = function(data, cb){
    db.account.insert({username:data.username, password:data.password}, function(err){
        savePlayerProgress({username:data.username, items:[]}, function(){
            cb();
        })
       cb();
    })
}

var getPlayerProgress = function(username, cb){
    db.progress.findOne({username:username}, function(err, res){
        cb({items:res.items});
    })
}

savePlayerProgress = function(data, cb){
    cb = cb || function(){}
    db.progress.update({username:data.username},{$set: {items: data.items}}, {upsert:true}, cb);
}


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
    socket.id = Math.random(); //gets a unique ID
    SOCKET_LIST[socket.id] = socket; //adds it to the dictionary

    socket.on('signIn', function(data){ //username, password
        isValidPassword(data, function(res){
            if(!res){
                return socket.emit("signInResponse", {success:false});
            }
            getPlayerProgress(data.username, function(progress){
                Player.onConnect(socket, data.username, progress);
                socket.emit("signInResponse", {success:true});
            })
        })
    });

    socket.on('signUp', function(data){
        isUsernameTaken(data, function(res){
            if(res){
                socket.emit("signUpResponse", {success:false});
            }
            else{
                addUser(data,function(){
                    Player.onConnect(socket, data.username, {items:[]});
                    socket.emit('signUpResponse', {success:true});
                })
            }
        })
    });
    socket.on('disconnect', function(){
        delete SOCKET_LIST[socket.id]; //removes the socket and player if they leave
        Player.onDisconnect(socket);
    });

    socket.on('evalServer', function(data){
        if (!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer', res);
    })
});


setInterval(function(){
    var packs = Entity.getFrameUpdateData();
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        if(socket.connected){
            socket.emit('init', packs.initPack);
            socket.emit('update', packs.updatePack);
            socket.emit('remove', packs.removePack);
        }
    }

},1000/25) //creates an interval to run the loop

