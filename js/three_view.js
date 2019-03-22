window.THREE = THREE || {};
var canW = 920; //canvas横:任意値 
var canH = 720; //canvas縦:任意値
var APP = { };
//ループ関数
APP.animate = function() {
    //APP.cube.rotation.x = APP.cube.rotation.x + 0.01;
    //APP.cube.rotation.y = APP.cube.rotation.y + 0.01;
    APP.renderer.render(APP.scene, APP.camera);
    window.requestAnimationFrame( APP.animate );

    APP.board.onEnterFrame();

    for(var i=0; i<APP.n; i++){
        APP.boxs[i].onEnterFrame();
    }
    APP.view_box.onEnterFrame();
}
//ピッキング処理
window.onmousedown = function (ev){
    if (ev.target == APP.renderer.domElement) { 
    
        //マウス座標2D変換
        var rect = ev.target.getBoundingClientRect();    
        APP.mouse.x =  ev.clientX - rect.left;
        APP.mouse.y =  ev.clientY - rect.top;
        
        //マウス座標3D変換 width（横）やheight（縦）は画面サイズ
        APP.mouse.x =  (APP.mouse.x / canW) * 2 - 1;           
        APP.mouse.y = -(APP.mouse.y / canH) * 2 + 1;
        
        // マウスベクトル
        var vector = new THREE.Vector3( APP.mouse.x, APP.mouse.y ,1);

       // vector はスクリーン座標系なので, オブジェクトの座標系に変換
        APP.projector.unprojectVector( vector, APP.camera );

        // 始点, 向きベクトルを渡してレイを作成
        var ray = new THREE.Raycaster( APP.camera.position, vector.sub( APP.camera.position ).normalize() );
        
         // クリック判定
        var obj = ray.intersectObjects( APP.targetList );
        
         // クリックしていたら、alertを表示  
        if ( obj.length > 0 ){                       
          
            //obj.touched();
            console.dir(obj[0].object);
            obj[0].object.name.ontouched()
       } 
 
    }
   }; 
function init(){
    APP.n = 6;
    n = APP.n;
    //ピッキング処理用
    APP.targetList = [];
    APP.mouse = { x: 0, y: 0 };
    APP.projector = new THREE.Projector();
    var container = document.getElementById('canvas-area');　　
    if(!Detector.webgl)Detector.addGetWebGLMessage({ parent: container});//WebGL環境確認
    APP.scene = new THREE.Scene();
    // カメラ:透視投影
    APP.camera = new THREE.PerspectiveCamera( 60, canW/canH, 1, 1000);
    APP.scene.add(APP.camera);
    APP.camera.lookAt(new THREE.Vector3(0, 0, 0));
    APP.camera.position.set(0, 0, 8);
    // ライト:環境光 + ポイントライトx3
    /*
    var ambientLight = new THREE.AmbientLight( 0x888888 );
    var pointLights = [];
    pointLights[0] = new THREE.PointLight( 0xffffff, .8, 0 );
    pointLights[1] = new THREE.PointLight( 0xffffff, .8, 0 );
    pointLights[2] = new THREE.PointLight( 0xffffff, .8, 0 );
    pointLights[0].position.set( 0, 200, 0 );
    pointLights[1].position.set( 100, 200, 100 );
    pointLights[2].position.set( -100, -200, -100 );
    ambientLight.castShadow = true;
    pointLights[0].castShadow = true; //影の有効化
    pointLights[1].castShadow = true;
    pointLights[2].castShadow = true;
    APP.scene.add(ambientLight, pointLights[0],pointLights[1],pointLights[2]);
    */
   //光源（DirectionalLight）の生成
    var light = new THREE.DirectionalLight(0xcccccc,1.6);   
    light.position.set(0, 0.1, 1).normalize();
        
    //影の有効化(光源) 
    light.castShadow = true;    
    light.shadow.camera.near = 0.00;
    light.shadow.camera.far = 10;
    APP.scene.add(light);
    // レンダラー
    APP.renderer = new THREE.WebGLRenderer({antialias: true});
    APP.renderer.setSize(canW,canH);
    APP.renderer.shadowMapEnabled = true; //影の有効化

    container.appendChild(APP.renderer.domElement);
    // ジオメトリー
    APP.board = new Board(APP.scene, APP.n, 1.15);

    var colors = ["rgb(0, 255, 0)", "rgb(255, 0, 0)", "rgb(0, 0, 255)", "rgb(255, 255, 0)", "rgb(0, 255, 255)", "rgb(255, 0, 255)"];
    APP.nowselectedcolor = colors[0];
    APP.boxs = new Array(APP.n);
    for(var i=0; i<APP.n; i++){
        var tmp_ctx;
        var geometry = new THREE.CubeGeometry(1,1,1);
        var material = new THREE.MeshBasicMaterial({
            map: (function() {
                var canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;
                tmp_ctx = canvas.getContext('2d');

                tmp_ctx.fillStyle = colors[i];
                tmp_ctx.fillRect(0, 0, 100, 100);
                tmp_ctx.transform(1, 0, 0, -1, 0, 100);
            
                return new THREE.Texture(canvas);
            })()
        });
        APP.boxs[i] = new THREE.Mesh(geometry, material);
    
        APP.boxs[i].ctx = tmp_ctx;

        APP.boxs[i].material.map.needsUpdate = true;
        APP.boxs[i].position.set(5, i - n/2 - 0.5, -0.5);
        APP.boxs[i].castShadow = true;
        APP.boxs[i].rotation.y = Math.PI;
        APP.boxs[i].add(APP.cube);

        APP.boxs[i].count = 0;
        (function(){
            var tmp_box = APP.boxs[i];
            var x = colors[i];
            tmp_box.ontouched = function(){
                APP.nowselectedcolor = x;
            };
            tmp_box.onEnterFrame = function(){
                var c = APP.board.search(n, x);
                if(tmp_box.count != c){
                    console.log(c);
                    tmp_box.ctx.fillStyle = x;
                    tmp_box.ctx.fillRect(0, 0, 100, 100);
                    tmp_box.ctx.fillStyle = "white";
                    tmp_box.ctx.strokeStyle = "black";
                    tmp_box.ctx.textAlign = "center";
                    tmp_box.ctx.font = "Bold 100px Arial";
                    tmp_box.ctx.fillText(c, 50,85, 100);
                    tmp_box.ctx.strokeText(c, 50,85, 100);
                    tmp_box.material.map.needsUpdate = true;
                    tmp_box.count = c;
                }
            }
        })();
        APP.boxs[i].name = APP.boxs[i];
        APP.scene.add(APP.boxs[i]);   
        APP.targetList.push(APP.boxs[i]);
    }
    //ディスプレイ色
    var tmp_ctx;
    var geometry = new THREE.CubeGeometry(1,1,1);
    var material = new THREE.MeshBasicMaterial({
        map: (function() {
            var canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            tmp_ctx = canvas.getContext('2d');

            tmp_ctx.fillStyle = APP.nowselectedcolor;
            tmp_ctx.fillRect(0, 0, 100, 100);
        
            return new THREE.Texture(canvas);
        })()
    });
    APP.view_box = new THREE.Mesh(geometry, material);

    APP.view_box.ctx = tmp_ctx;

    APP.view_box.material.map.needsUpdate = true;
    APP.view_box.position.set(5, 4, -0.5);
    APP.view_box.castShadow = true;
    APP.view_box.rotation.x = Math.PI;
    APP.view_box.add(APP.cube);

    APP.view_box.count = 0;

    APP.view_box.nowcolor = APP.nowselectedcolor;
    (function(){
        var tmp_box = APP.view_box;
        tmp_box.onEnterFrame = function(){
            if(APP.nowselectedcolor != tmp_box.nowcolor){
                console.log("c");
                tmp_box.ctx.fillStyle = APP.nowselectedcolor;
                tmp_box.ctx.fillRect(0, 0, 100, 100);
                tmp_box.material.map.needsUpdate = true;
                tmp_box.nowcolor = APP.nowselectedcolor;
            }
        }
    })();
    APP.view_box.name = APP.view_box;
    APP.scene.add(APP.view_box);   
    /*
    //コントローラー
    controls = new THREE.OrbitControls(APP.camera, APP.renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.maxPolarAngle = (Math.PI * 0.48);
    //自動回転
    //controls.autoRotate = true;
    //controls.autoRotateSpeed = 2.0;
    rendering();
    //*/
    APP.animate();
}
function rendering(){
    requestAnimationFrame(rendering, APP.renderer.domElement);
    controls.update();
    APP.renderer.render(APP.scene, APP.camera);
}
////////////////////////////////////////////
class StoneSprite {
    constructor(x, y){
        this.nowcolor = "rgb(0, 255, 0)";
        this.nextcolor = "rgb(255, 255, 255)";
        var geometry = new THREE.CylinderGeometry( 0.5, 0.5, 0.2, 30 );
        var tmp_this = this;
        var material = new THREE.MeshPhongMaterial({color: 0xFF0000,side: THREE.DoubleSide});
        //*
        var material = new THREE.MeshBasicMaterial({
            map: (function() {
                var canvas = document.createElement("canvas");
                canvas.width = 100;
                canvas.height = 100;
                tmp_this.ctx = canvas.getContext('2d');

                tmp_this.ctx.fillStyle = tmp_this.nextcolor;
                tmp_this.ctx.fillRect(0, 0, 100, 100);
                tmp_this.ctx.fillStyle = tmp_this.nowcolor;
              
                return new THREE.Texture(canvas);
              })()
        });
        //*/
        this.stone = new THREE.Mesh(geometry, material);
        this.stone.material.map.needsUpdate = true;
        this.stone.position.set(x, y, 10);
        this.stone.rotation.x = Math.PI/2;
        this.stone.castShadow = true;
        //this.stone.receiveShadow = true;

        //this.light = new THREE.PointLight( 0xffffff, 5, 100 );  // 白、強さ5、距離100まで減衰
        //this.light.position.set(x,y,0);

        this.moving = false;
        this.cnt = 0;
        this.turn = null; //ターンの方向
        this.nowcolor = "rgb(0, 255, 0)";
        this.nextcolor = "rgb(255, 255, 255)";
        this.isputed = false;
    }

    onEnterFrame(){
        var turnframe = 20;
        var moveframe = 30;
        if(this.turn != null && turnframe > this.cnt){
            if(this.cnt == turnframe/2){
                this.ctx.fillStyle = this.nextcolor;
                this.ctx.fillRect(0, 0, 100, 100);
                
                this.stone.material.map.needsUpdate = true;
            }
            this.stone.position.z = this.smooth(0, 1, turnframe/2, this.cnt);
            if(turnframe <= this.cnt + 1){
                this.turn = null;
                this.nowcolor = this.nextcolor;
                this.stone.position.z = 0;
                //this.light.power = 0;
            }else{
                this.cnt++;
                //this.light.power = 5;
            }
            this.moving = false;
        }
        else if(this.moving && moveframe > this.cnt){
            this.isputed = true;
            if(this.cnt == 0){
                this.ctx.fillStyle = this.nextcolor;
                this.ctx.fillRect(0, 0, 100, 100);
                this.stone.material.map.needsUpdate = true;

                this.nowcolor = this.nextcolor;
            }
            this.stone.position.z = this.smooth(10, 0, moveframe, this.cnt);
            if(moveframe <= this.cnt + 1){
                this.moving = false;
                console.log("puted");
            }else{
                this.cnt++;
            }
        }
    }

    ontouched(){
        /*
        this.ctx.fillStyle = "rgb(255, 0, 255)";
        this.ctx.fillRect(0, 0, 100, 100);
        this.stone.material.map.needsUpdate = true;
        */
       this.nextcolor = APP.nowselectedcolor;
        this.turn = new Object();
        this.turn.x = 1;
        this.turn.y = -1;
        this.cnt = 0;
    }

    smooth(first, end, frame, now){
        return (end-first)*Math.sin(Math.PI*now/(2*frame)) + first;
    }
}

class BoardPiece {
    constructor(x, y, i, j, stone, board){
        this.i = i;
        this.j = j;
        this.stone = stone;   
        this.board = board;  
        

        var geometry = new THREE.CubeGeometry(1.1,1.1,1.1);
        var material = new THREE.MeshPhongMaterial({color: 0xDDDDDD,side: THREE.DoubleSide});
        this.piece = new THREE.Mesh(geometry, material);
        this.piece.position.set(x, y, -0.7);
        this.piece.receiveShadow = true;
        this.istouched = false;
    }

    onEnterFrame(){
    }

    ontouched(){
        if(this.istouched) return;
        
        for(var i=-1; i<=1; i++){
            for(var j=-1; j<=1; j++){
                if(i == 0 && j == 0) continue;
                if(this.board[this.i + i][this.j + j] == null) continue;
                this.board[this.i + i][this.j + j].reversi(i, j, APP.nowselectedcolor, 0);
            }
        }
        this.stone.moving = true;
        this.stone.nextcolor = APP.nowselectedcolor;
        this.istouched = true;
    }

    reversi(difi, difj, color, n){
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
                    ts.nextcolor = APP.nowselectedcolor;
                },  220 + n*110);
            })();
        }
        return true;
    }
}

class Board {
    constructor(scene, n, size){
        this.n = n;
        var maxsize = size * (n + 2);
        var h = (-maxsize + size)/2;
        var w = (-maxsize + size)/2 - 1.5;
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
                this.stones[i][j].stone.name = this.stones[i][j];
                scene.add(this.stones[i][j].stone);
                scene.add(this.stones[i][j].light);
                APP.targetList.push(this.stones[i][j].stone);

                this.board[i][j] = new BoardPiece(w+j*size, h+i*size, i, j, this.stones[i][j], this.board);
                this.board[i][j].piece.name = this.board[i][j];
                scene.add(this.board[i][j].piece);
                APP.targetList.push(this.board[i][j].piece);
            }
        }
    }

    search(n, color){
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

    onEnterFrame(){
        var n=this.n;
        for(var i=1; i<n+1; i++){
            for(var j=1; j<n+1; j++){
                this.stones[i][j].onEnterFrame();
                this.board[i][j].onEnterFrame();
            }
        }
    }
}
//////////////////////////////////////
$(function(){
    init();
});