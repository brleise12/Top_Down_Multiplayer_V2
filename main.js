window.addEventListener('DOMContentLoaded', DOMContentLoaded => {

    //Websocket
    const socket = new WebSocket('wss://southwestern.media/game_dev')
    socket.addEventListener('open', open => {
        console.log('WEBSOCKET STARTED');
    });

    //Intialze Canvas
    const render = document.querySelector('canvas').getContext('2d');
    const U_Scale = 128; 
    let w, h, u;
    const resize = () => {
        w = render.canvas.width = render.canvas.clientWidth * window.devicePixelRatio;
        h = render.canvas.height = render.canvas.clientHeight * window.devicePixelRatio;
        u = h / U_Scale;
        render.imageSmoothingEnabled = false;
    };
    resize();
    window.addEventListener('resize', resize);

    // Bringing in the Angry Dude
    const player_Avatar = new Image();
    player_Avatar.src = 'sprites/angry_Dude_V2.png';

    // Player Input
    const movement = {ArrowRight: false, ArrowLeft: false, ArrowDown: false, ArrowUp: false};
    document.addEventListener('keydown', keydown => {
        if(movement.hasOwnProperty(keydown.key)) {
            movement[keydown.key] = true;
        }
    });
    document.addEventListener('keyup', keyup => {
        if(movement.hasOwnProperty(keyup.key)) {
            movement[keyup.key] = false;
        }
    });

    //Calm Dude
    const GAME = 'Angry_Dudes'
    const NAME = Math.random().toString();
    const enemies = {};
    const send = message => {
        socket.send(JSON.stringify({GAME, Name: NAME, Message: message}));
    };
    socket.addEventListener('message', message => {
        const parsed = JSON.parse(message.data);
        if(parsed.Game != GAME || parsed.Name === NAME) {
            return; 
        }
        if(parsed.Message === 'goodbye') {
            console.log('GOODBYE');
            delete enemies[parsed.Name];
            return;
        }
        enemies[parsed.Name] = JSON.parse(parsed.Message);
    });
    const calm_Dude = new Image();
    calm_Dude.src = 'sprites/calm_Dude_V2.png';
    socket.addEventListener('beforeunload', beforeunload => {
        send('goodbye');
        beforeunload['returnValue'] = null;
    });

    //Patterns
    const patterns = {};
    const rock = new Image();
    rock.src = 'sprites/rock_V3.png';
    rock.addEventListener('load', load =>{
        patterns.rock = render.createPattern(rock, 'repeat');
    });
    const grass = new Image();
    grass.src = 'sprites/grass_Texture_V1.png';
    grass.addEventListener('load', load => patterns.grass = render.createPattern(grass, 'repeat'));

    //Object
    class O_Body {
        constructor (x, y, w, h) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
    }
    const O_Bodys = [];
    // add more rocks to make a maze
    O_Bodys.push(new O_Body(114, 0, 32, 140))
    O_Bodys.push(new O_Body(-16, 0, 32, 140))
    O_Bodys.push(new O_Body(-16, 250, 750, 14))
    O_Bodys.push(new O_Body(750, 250, 32, 800))
    O_Bodys.push(new O_Body(-155, -400, 32, 800))
    O_Bodys.push(new O_Body(-155, -400, 750, 45))
    O_Bodys.push(new O_Body(600, -400, 32, 450))
    O_Bodys.push(new O_Body(-750, 365, 2800, 32))
    O_Bodys.push(new O_Body(750, -365, 32, 3200))
    O_Bodys.push(new O_Body(400, 200, 40, 32))
    O_Bodys.push(new O_Body(-125, 100, 40, 32))
    O_Bodys.push(new O_Body(-75, -240, 40, 32))
    O_Bodys.push(new O_Body(125, 200, 130, 32))
    O_Bodys.push(new O_Body(-547, 200, 40, 65))
    O_Bodys.push(new O_Body(500, -345, 40, 62))
    O_Bodys.push(new O_Body(0, -145, 240, 62))
    O_Bodys.push(new O_Body(400, -345, 40, 262))
    O_Bodys.push(new O_Body(-200, -145, 40, 162))
    O_Bodys.push(new O_Body(432, -245, 240, 62))

    //The Animation Loop
    let frame_number = false;
    let frame_count = 0;
    const IMG_SIDE = 45;
    let player_direct = 0;
    let x = 16, y = 16;
    const animation = timestamo => {

        //Initiliae Animation
        frame_count++;
        render.clearRect(0, 0, w, h)
        render.fillRect(w / 2, h / 2, u, u);
        render.save();
        render.scale(u, u);
        render.fillStyle = patterns.grass;
        render.fillRect(0, 0, w, h);
        render.translate(-Math.floor(x / U_Scale) * U_Scale, -Math.floor(y / U_Scale) * U_Scale);


        //Moving Angry Dude
        let left = movement.ArrowLeft, right = movement.ArrowRight, up = movement.ArrowUp, down = movement.ArrowDown;
        let vx = +right - +left;
        let vy = +down - +up;
        if(right || up || left || down) {
            player_direct = right ? 1 : up ? 2: down ? 3 : 0;
            if(frame_count % 10 == 0) {
                frame_number = !frame_number;
      }
     }

     //Colliders
     O_Bodys.forEach(o_Body => {
        if(o_Body.y <= y + IMG_SIDE && y < o_Body.y + o_Body.h) {
            if(x + IMG_SIDE <= o_Body.x && o_Body.x < x + IMG_SIDE + vx) {
                vx = 0;
                x = o_Body.x - IMG_SIDE;
            }
            if(o_Body.x + o_Body.w <= x && x + vx < o_Body.x + o_Body.w) {
                vx = 0;
                x = o_Body.x + o_Body.w;
            }
        }
        if(o_Body.x <= x + IMG_SIDE && x <= o_Body.x + o_Body.w) {
            if(y + IMG_SIDE <= o_Body.y && o_Body.y < y + IMG_SIDE + vy) {
                 vy = 0;
                 y = o_Body.y - IMG_SIDE;
            }
            if(o_Body.y + o_Body.h <= y && y + vy < o_Body.y + o_Body.h) {
                 vy = 0;
                 y = o_Body.y + o_Body.h;
            }
        }
     });
     x += vx;
     y += vy;
     if(vx || vy) {
         send(JSON.stringify({x: x, y: y}));
     }

        // Render Stuff
        render.fillStyle = patterns.rock;
        O_Bodys.forEach(o_Body => {
            render.fillRect(o_Body.x, o_Body.y, o_Body.w, o_Body.h);
        });
        Object.values(enemies).forEach(enemy => {
           render.drawImage(calm_Dude, 0, 0, IMG_SIDE, IMG_SIDE, enemy.x, enemy.y, IMG_SIDE, IMG_SIDE);
           if(enemy.x < x + IMG_SIDE && x < enemy.y < y + IMG_SIDE && y < enemy.y) {
               console.log('COLLISION')
           }
        });
        render.drawImage(player_Avatar, +frame_number * IMG_SIDE, player_direct * IMG_SIDE, IMG_SIDE, IMG_SIDE, x, y, IMG_SIDE, IMG_SIDE);
    
        render.restore();
        window.requestAnimationFrame(animation);
    };
    window.requestAnimationFrame(animation)
});
