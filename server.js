const Proxy = require('http-mitm-proxy');
const net = require('net');
const songData = require('./data.json');
const config = require('./config.json');
const discord = require('discord-rich-presence')('422212348107948052');
const proxy = Proxy();
const port = config.port || 8081;

let SIFRP = {
  user: {
    name: 'User',
    id: 0,
    rank: 0
  },
  curState: null,
  curDetails: null,
  chaFesRound: 0,
}

const setPresence = (state, details, force = false) => {
  if (SIFRP.curState === state && SIFRP.curDetails === details && force === false) return;
  let data = {
    state: state,
    details: details,
    largeImageKey: 'sif_def_chika',
    largeImageText: 'Love Live! School idol festival',
    instance: true,
    }
  if (!config.hideUser) {
    data.smallImageKey = 'user_icon';
    data.smallImageText = `${SIFRP.user.name} (ID ${SIFRP.user.id} - rank ${SIFRP.user.rank})`;
  }
  discord.updatePresence(data);
  console.log(`Updating presence: ${details} / ${state}`);
  SIFRP.curState = state;
  SIFRP.curDetails = details;
}

const getSongData = (id) => {
  let data = {};
  data.data = songData[id] || undefined;
  if (data.data && data.data[0] && data.data[1]) {
    data.title = `${data.data[0]} [${data.data[1]}]`;
  } else {
    data.title = 'undefined';
  }
  return data;
}

proxy.onError((ctx, err) => {
  console.error('Server error:', err);
});

proxy.onConnect((req, socket, head) => {
  let host = req.url.split(":")[0];
  let port = req.url.split(":")[1];

  let conn = net.connect(port, host, () => {
    socket.write('HTTP/1.1 200 OK\r\n\r\n', 'UTF-8', () => {
      conn.pipe(socket);
      socket.pipe(conn);
    })
  });
  conn.on("error", function(e) {
    // console.log('Tunnel error', e);
  })
});

proxy.onRequest(function(ctx, callback) {
  let request = ctx.clientToProxyRequest;
  let response_chunks = [];
  if (request.headers.host == 'prod.en-lovelive.klabgames.net') {
    ctx.use(Proxy.gunzip);

    ctx.onResponseData((ctx, chunk, callback) => {
      response_chunks.push(chunk);
      return callback(null, chunk);
    });

    ctx.onResponseEnd((ctx, callback) => {
      if (request.url.includes('/webview.php') || request.url.includes('/favicon.ico')) return callback();
        let raw_body = Buffer.concat(response_chunks).toString();
        response_chunks = [];
        if (raw_body.substr(0, 1) != '{') return callback();
        let body = JSON.parse(raw_body);
        body = body.response_data;
        if (request.url.includes('/main.php/user/userInfo')) {
          let user = body.user;
          SIFRP.user = {
            name: user.name,
            id: user.user_id,
            rank: user.level
          }
          setPresence('Idle', 'Idle', true);
        } else if (request.url.includes('/main.php/live/play')) {
          if (body.error_code) return callback();
            let live = body.live_list[0].live_info;
            let song = getSongData(live.live_difficulty_id);
            let songTitle = song.title;
            setPresence('Playing', song.title);
        } else if (request.url.includes('/main.php/challenge/proceed')) {
            if (body.error_code) return callback();
            setPresence(`Challenge Festival (Round ${SIFRP.chaFesRound}/5)`, 'Playing');
        } else if (request.url.includes('/main.php/challenge/checkpoint')) {
            if (body.challenge_info) {
              SIFRP.chaFesRound = body.challenge_info.round;
              setPresence(`Challenge Festival (Round ${SIFRP.chaFesRound}/5)`, 'Idle');
            } else {
              setPresence('Idle', 'Idle');
            }
        } else if (request.url.includes('/main.php/challenge/status')) {
            SIFRP.chaFesRound = body.challenge_info.round;
            setPresence(`Challenge Festival (Round ${SIFRP.chaFesRound}/5)`, 'Idle');
        } else {
          setPresence('Idle', 'Idle');
        }
        return callback();
    });
  }
  return callback();
});

proxy.listen({ port }, () => {
  console.log('SIFRP started!\nServer port: ' + port);
});