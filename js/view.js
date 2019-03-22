// おまじない
enchant();

var moveStageToCenter = function(core) {
    var stagePos = {
        top: (window.innerHeight - (core.height * core.scale)) / 2,
        left: (window.innerWidth - (core.width * core.scale)) / 2,
    };
    var stage = document.getElementById('enchant-stage');
    stage.style.position = 'absolute';
    stage.style.top = stagePos.top + 'px';
    stage.style.left = stagePos.left + 'px';
    core._pageX = stagePos.left;
    core._pageY = stagePos.top;
};

var nowselectedcolor = "rgb(0, 255, 0)";

window.onload = function() {
    var game = new Game(1080, 920);
    
    game.onload = function() {
        moveStageToCenter(game);
        game.fps = 60;
        var n=6;
        // 3D 用シーン生成
        var scene = new Scene3D();
        /*
        vshader = toonvshader;
        fshader = toonfshader;

        toonMap = new Texture("toon.png");
        gl.activeTexture(gl.TEXTURE1); //テクスチャ1を有効化
        gl.bindTexture(gl.TEXTURE_2D, toonMap._glTexture);
        toonSampler = gl.getUniformLocation(scene.shaderProgram, 'uToonSampler');
        gl.uniform1i(toonSampler, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP);
        toonUse = gl.getUniformLocation(scene.shaderProgram, 'uUseToon');
        gl.activeTexture(gl.TEXTURE0);
        */
        // ライト生成
        var light = new DirectionalLight(); // 平行光源生成
        light.directionZ =-1;               // 向き
        light.color = [1.0, 1.0, 1.0];      // 色
        scene.setDirectionalLight(light);   // scene にセット
        
        // カメラ生成
        var camera = new Camera3D();                                // カメラ生生
        camera.x = 0; camera.y = 0; camera.z = -25;                 // カメラ位置をセット
        camera.centerX = 0; camera.centerY = 0; camera.centerZ = 0; // 注視点をセット
        scene.setCamera(camera);                                    // scene にセット
        // scene にセット

        var board = new Board(scene, n, 1.2);
        //var stones = new Stones(scene, n, 1.2);

        var colors = ["rgb(0, 255, 0)", "rgb(255, 0, 0)", "rgb(0, 0, 255)", "rgb(255, 255, 0)", "rgb(0, 255, 255)", "rgb(255, 0, 255)"];

        for(var i=0; i<n; i++){
            var box = new Box();
        
            box.x = -5;
            box.y = i - n/2 - 0.5;
            box.z = 4; // 位置をセット

            //テクスチャ
            var sf = new Surface(100, 100); // 100x100の解像度を持つテクスチャを作る
            var ctx = sf.context; // getContext('2d')と同じオブジェクトが返る
            ctx.fillStyle = colors[i];
            ctx.fillRect(0, 0, 100, 100);
            sf._element.src = Math.random(); //おまじないプロパティ(特に複数のSurfaceを扱うとき)
            box.mesh.texture.src = sf;
    
            box.count = 0;
            box.rotateRoll(Math.PI);
            (function(){
                var tmp_box = box;
                var x = colors[i];
                tmp_box.ontouchstart = function(){
                    nowselectedcolor = x;
                };
                tmp_box.onenterframe = function(){
                    var c = board.search(n, x);
                    if(tmp_box.count != c){
                        console.log(c);
                        var sf = new Surface(100, 100); // 100x100の解像度を持つテクスチャを作る
                        var ctx = sf.context; // getContext('2d')と同じオブジェクトが返る
                        ctx.fillStyle = x;
                        ctx.fillRect(0, 0, 100, 100);
                        ctx.fillStyle = "white";
                        ctx.strokeStyle = "black";
                        ctx.textAlign = "center";
                        ctx.font = "Bold 100px Arial";
                        ctx.fillText(c, 50,85, 100);
                        ctx.strokeText(c, 50,85, 100);
                        sf._element.src = Math.random(); //おまじないプロパティ(特に複数のSurfaceを扱うとき)
                        this.mesh.texture.src = sf;
                        tmp_box.count = c;
                    }
                }
            })();
            scene.addChild(box);   
        }

        var displaybox = new Box;
    
        displaybox.x = -5;
        displaybox.y = 3.5;
        displaybox.z = 4; // 位置をセット


        displaybox.nowcolor = null;
        displaybox.onenterframe = function(){
            if(this.nowcolor != nowselectedcolor){
                var sf = new Surface(100, 100); // 100x100の解像度を持つテクスチャを作る
                var ctx = sf.context; // getContext('2d')と同じオブジェクトが返る
                ctx.fillStyle = nowselectedcolor;
                ctx.fillRect(0, 0, 100, 100);
                sf._element.src = Math.random(); //おまじないプロパティ(特に複数のSurfaceを扱うとき)
                this.mesh.texture.src = sf;
            }
        }

        scene.addChild(displaybox);   
    };
    
    game.start();
};


var StoneSprite = Class.create(Cylinder, {
    initialize : function(x, y){
        Cylinder.call(this);

        this.x = x;
        this.y = y;
        this.z = -30; // 位置をセット
        this.scaleY = 0.1;

        //this.mesh.texture.diffuse      =[1.0,  0.0,  0.0,  0.0];  //ディフューズ
        //this.mesh.texture.emmission = [1.0,  0.0,  0.0,  1.0];//自発光


        this.rot = Math.PI/2;
        this.rotatePitch(this.rot);

        this.onenterframe = this.onEnterFrame;
        //this.ontouchstart = this.touched;

        this.moving = false;
        this.cnt = 0;

        this.turn = null; //ターンの方向
        this.nowcolor = "rgb(0, 255, 0)";
        this.nextcolor = "rgb(255, 255, 255)";
        this.isputed = false;
        //テクスチャ
        var sf = new Surface(100, 100); // 100x100の解像度を持つテクスチャを作る
        var ctx = sf.context; // getContext('2d')と同じオブジェクトが返る
        ctx.fillStyle = this.nextcolor;
        ctx.fillRect(0, 0, 100, 50);
        ctx.fillStyle = this.nowcolor;
        ctx.fillRect(0, 50, 100, 50);
        sf._element.src = Math.random(); //おまじないプロパティ(特に複数のSurfaceを扱うとき)
        this.mesh.texture.src = sf;
    },

    onEnterFrame : function(){
        var turnframe = 20;
        var moveframe = 30;
        if(this.turn != null && turnframe > this.cnt){
            if(this.cnt == 0){
                this.rot = Math.PI/2;
                this.rotation = [
                    1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 1, 0, 0,
                    0, 0, 0, 1
                ];
                var sf = new Surface(100, 100); // 100x100の解像度を持つテクスチャを作る
                var ctx = sf.context; // getContext('2d')と同じオブジェクトが返る
                ctx.fillStyle = this.nowcolor;
                ctx.fillRect(0, 0, 100, 50);
                ctx.fillStyle = this.nextcolor;
                ctx.fillRect(0, 50, 100, 50);
                sf._element.src = Math.random(); //おまじないプロパティ(特に複数のSurfaceを扱うとき)
                this.mesh.texture.src = sf;
                this.nowcolor = this.nextcolor;
            }
            this.rotationApply(new Quat(this.turn.x, 0, this.turn.y, Math.PI/turnframe));
            this.z = this.smooth(0, -1, turnframe/2, this.cnt);
            if(turnframe <= this.cnt + 1){
                this.turn = null;
            }else{
                this.cnt++;
            }
            this.moving = false;
        }
        else if(this.moving && moveframe > this.cnt){
            this.isputed = true;
            if(this.cnt == 0){
                var sf = new Surface(100, 100); // 100x100の解像度を持つテクスチャを作る
                var ctx = sf.context; // getContext('2d')と同じオブジェクトが返る
                ctx.fillStyle = this.nowcolor;
                ctx.fillRect(0, 0, 100, 50);
                ctx.fillStyle = this.nextcolor;
                ctx.fillRect(0, 50, 100, 50);
                sf._element.src = Math.random(); //おまじないプロパティ(特に複数のSurfaceを扱うとき)
                this.mesh.texture.src = sf;
                this.nowcolor = this.nextcolor;
            }
            this.z = this.smooth(-30, 0, moveframe, this.cnt);
            if(moveframe <= this.cnt + 1){
                this.moving = false;
                console.log("puted");
            }else{
                this.cnt++;
            }
        }
        else{
            /*
            this.rot += Math.PI/90;
            this.rotation = [
                1, 0, 0, 0,
                0, Math.cos(this.rot), -Math.sin(this.rot), 0,
                0, Math.sin(this.rot), Math.cos(this.rot), 0,
                0, 0, 0, 1
            ];
            //*/
        }
    },

    touched : function(){
    },

    smooth : function(first, end, frame, now){
        return (end-first)*Math.sin(Math.PI*now/(2*frame)) + first;
    }
});

var BoardPiece = Class.create(Box, {
    initialize : function(x, y, i, j, stone, board){
        Box.call(this);
        this.i = i;
        this.j = j;
        this.stone = stone;   
        this.board = board;   

        this.x = x;
        this.y = y;
        this.z = 2; // 位置をセット
        this.scaleX = 1.1;
        this.scaleY = 1.1;
        this.scaleZ = 4;

        this.addEventListener(Event.ENTER_FRAME, this.onEnterFrame);
        //this.ontouchstart = this.touched;
        this.addEventListener('touchstart', this.touched);
    },

    onEnterFrame : function(){
    },

    touched : function(){
        for(var i=-1; i<=1; i++){
            for(var j=-1; j<=1; j++){
                if(i == 0 && j == 0) continue;
                if(this.board[this.i + i][this.j + j] == null) continue;
                this.board[this.i + i][this.j + j].reversi(i, j, nowselectedcolor, 0);
            }
        }
        this.stone.moving = true;
        this.stone.nextcolor = nowselectedcolor;
        this.ontouchstart = null;
    },

    reversi : function(difi, difj, color, n){
        if(!this.stone.isputed) return false;
        console.log("a" + this.i + "," + this.j);
        if(this.stone.nowcolor == color) {console.log("t"+this.i + "," + this.j);return true};
        console.log("b" + this.i + "," + this.j + this.stone.nowcolor + "," + color);
        //ひっくり返す
        if(this.board[this.i + difi][this.j + difj] == null) return false;
        console.log(this.i + "," + this.j + "|" + (this.i + difi) + "," + (this.j + difj) );
        if(!this.board[this.i + difi][this.j + difj].reversi(difi, difj, color, n+1)) return false;
        if(this.stone.turn == null){
            var ts = this.stone;
            (function(){
                setTimeout(function(){
                    ts.turn = new Object();
                    ts.turn.x = difi;
                    ts.turn.y = -difj;
                    ts.cnt = 0;
                    ts.nextcolor = nowselectedcolor;
                },  220 + n*110);
            })();
        }
        return true;
    }
});

var Board = Class.create({
    initialize : function(scene, n, size){
        var maxsize = size * (n + 2);
        var h = (-maxsize + size)/2;
        var w = (-maxsize + size)/2 + 1;
        this.board = new Array(n+2);
        this.stones = new Array(n+2);
        this.board[0] = new Array(n+2);
        this.board[n+1] = new Array(n+2);
        this.stones[0] = new Array(n+2);
        this.stones[n+1] = new Array(n+2);
        for(var i=1; i<n+1; i++){
            this.board[i] = new Array(n+2);
            this.stones[i] = new Array(n+2);
            this.board[i][0] = this.board[i][n+1] = this.board[0][i] = this.board[n+1][i] = null;
            this.stones[i][0] = this.stones[i][n+1] = this.stones[0][i] = this.stones[n+1][i] = null;
            for(var j=1; j<n+1; j++){
                this.stones[i][j] = new StoneSprite(w+j*size, h+i*size);
                scene.addChild(this.stones[i][j]);

                this.board[i][j] = new BoardPiece(w+j*size, h+i*size, i, j, this.stones[i][j], this.board);
                scene.addChild(this.board[i][j]);   
            }
        }
    },

    search : function(n, color){
        var count = 0;
        for(var i=1; i<n+1; i++){
            for(var j=1; j<n+1; j++){
                if(!this.stones[i][j].isputed) continue;
                if(this.stones[i][j].nowcolor == color)
                    count++;
            }
        }
        return count;
    }
});