var http  = require('http');
var fs    = require('fs');
var path  = require('path');
var mime  = require('mime');
var cache = {};

//Function that Handle the error if a file doesn't exist
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

//Function that sendFile in a page
function sendFile(response, filePath, fileContents) {
  response.writeHead(200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}


//Se un file è nella cache lo serve subito, altrimenti lo legge dal disco, lo sarva nella
//cache e lo serve, se il file non esiste, da errore
function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if (exists) {
        fs.readFile(absPath, function(err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
		  });
		} else {
        send404(response);
      }
  });
  }
}

//Creo il server in modo da gestire tutte le possibili richieste
var server = http.createServer(function(request, response) {
  var filePath = false;
  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }
  //Trasforma l'url in relativo
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

server.listen(3000, function(){
	console.log("Server listen on port 3000.")
});


var chatServer = require('./lib/chat_server');
chatServer.listen(server);

