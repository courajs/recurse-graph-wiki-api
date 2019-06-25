var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});
app.get('/doc/:doc_id', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});
//
// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

let io = require('socket.io')(listener);
io.on('connection', ()=>console.log('socket connection'));
