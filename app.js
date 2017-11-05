const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
//const port = process.env.PORT, '0.0.0.0';
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 8080;
users = [];
/*app.get('/', function(req, res) {
res.sendFile(__dirname + '/index.html');
});
*/
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', function (socket) {

    // Bağlanan kullanıcıyı clientten al
    socket.on('user', function (person) {

        // Online kullanıcı listesini bağlanandan sonra güncelle ve gönder
        socket.username = person;
        users.push(socket.username);
        io.sockets.emit('get users', users);

        // Bağlanan kullanıcıyı cliente gönder
        io.emit('connected', person);


        socket.on('disconnect', function () {
            // Online kullanıcı listesini ayrılandan sonra güncelle ve gönder
            users.splice(users.indexOf(socket.username), 1);
            io.sockets.emit('get users', users);

            // Ayrılan kullanıcıyı cliente gönder
            io.emit('disconnected', person);
        });
    });
    // Bağlanan - Ayrılan kullanıcı ismini msg değişkeniyle ciliente gönder
    socket.on('connectionMsg', function (msg) {
        io.emit('connectionMsg', msg);
    });

    // Clientten gelen mesaj içeriğini herkese yay
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
        // Dosyaya yazdır
        /*
        fs.appendFile('public/mesajKayit.txt', msg, function(err) {
            if (err) throw err;
            console.log('Mesaj dosyaya yazıldı.');
        });
        */

        // Yazılan mesajı text dosyasına kaydet
        const logger = fs.createWriteStream('public/mesajKayit.txt', {
            flags: 'a'
        });
        logger.write(msg + '\n');
    });

    // Kullanıcı yazıyor mu clientten öğren ve herkese gönder
    socket.on('typing', function (data) {
        //console.log(data);
        socket.broadcast.emit('typing', data);
    });
});

// Server dinleme portunu başlat
//http.listen(process.env.PORT, '0.0.0.0');
app.listen(port, function () {
    console.log('Sunucu başladı.')
});