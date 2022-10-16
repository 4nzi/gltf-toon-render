import { parseGLB } from "./parseGLB"
import { glUtils } from "./glUtils"
import { matIV } from "./minMatrix.js"
import vertexShader from "./shaders/vertexShader.glsl"
import fragmentShader from "./shaders/fragmentShader.glsl"

export default class GLTFToonRender {
    constructor(canvas) {
        this.canvas = canvas
        this.atributes = {}
    }

    setSize = (width, height) => {
        this.canvas.width = width
        this.canvas.height = height
    }

    loadGLB = async (url) => {
        const reader = new FileReader()
        const res = await (await fetch(url)).blob()

        reader.readAsArrayBuffer(res)
        reader.onload = () => {
            const atributes = parseGLB(reader.result)
            Object.assign(this.atributes, atributes)

            const gl = this.canvas.getContext('webgl')

            const {
                create_vertexShader,
                create_fragmentShader,
                create_program,
                create_vbo,
                set_attribute,
                create_ibo,
            } = glUtils(gl)


            // 頂点シェーダとフラグメントシェーダの生成
            const v_shader = create_vertexShader(vertexShader);
            const f_shader = create_fragmentShader(fragmentShader);

            // プログラムオブジェクトの生成とリンク
            const prg = create_program(v_shader, f_shader);

            // attributeLocationを配列に取得
            const attLocation = new Array();
            attLocation[0] = gl.getAttribLocation(prg, 'position');
            attLocation[1] = gl.getAttribLocation(prg, 'normal');
            attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');

            // attributeの要素数を配列に格納
            const attStride = new Array();
            attStride[0] = 3;
            attStride[1] = 3;
            attStride[2] = 2;

            // モデルの頂点データを生成
            const position = this.atributes.pos;
            const normal = this.atributes.nor;
            const uv = this.atributes.uv
            const index = this.atributes.inx;

            // VBOの生成
            const pos_vbo = create_vbo(position);
            const nor_vbo = create_vbo(normal)
            const uv_vbo = create_vbo(uv);

            // VBO を登録する
            set_attribute([pos_vbo, nor_vbo, uv_vbo], attLocation, attStride);

            // IBOの生成
            var ibo = create_ibo(index);

            // IBOをバインドして登録する
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

            // uniformLocationを配列に取得
            var uniLocation = new Array();
            uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
            uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
            uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');
            uniLocation[3] = gl.getUniformLocation(prg, 'texture');

            // minMatrix.js を用いた行列関連処理
            // matIVオブジェクトを生成
            var m = new matIV();

            // 各種行列の生成と初期化
            var mMatrix = m.identity(m.create());
            var vMatrix = m.identity(m.create());
            var pMatrix = m.identity(m.create());
            var tmpMatrix = m.identity(m.create());
            var mvpMatrix = m.identity(m.create());
            var invMatrix = m.identity(m.create());

            // ビュー×プロジェクション座標変換行列
            m.lookAt([0.0, 0.0, 10.0], [0, 0, 0], [0, 1, 0], vMatrix);
            m.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100, pMatrix);
            m.multiply(pMatrix, vMatrix, tmpMatrix);

            // 平行光源の向き
            var lightDirection = [-0.5, 0.5, 0.5];

            // カウンタの宣言
            var count = 0;

            // カリングと深度テストを有効にする
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.CULL_FACE);

            // 有効にするテクスチャユニットを指定
            gl.activeTexture(gl.TEXTURE0);

            // テクスチャ用変数の宣言
            let texture = null;

            // テクスチャを生成
            create_texture(atributes.tex);

            // 恒常ループ
            (function loop() {
                // canvasを初期化
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clearDepth(1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // カウンタを元にラジアンを算出
                count++;
                var rad = (count % 360) * Math.PI / 180;

                // テクスチャをバインドする
                gl.bindTexture(gl.TEXTURE_2D, texture);

                // モデル座標変換行列の生成
                m.identity(mMatrix);
                m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
                m.multiply(tmpMatrix, mMatrix, mvpMatrix);

                // モデル座標変換行列から逆行列を生成
                m.inverse(mMatrix, invMatrix);

                // uniform変数の登録
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
                gl.uniform3fv(uniLocation[2], lightDirection);
                gl.uniform1i(uniLocation[3], 0);

                // モデルの描画
                gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

                // コンテキストの再描画
                gl.flush();

                // ループのために再帰呼び出し
                setTimeout(loop, 1000 / 30);
            })()

            function create_texture(source) {
                // イメージオブジェクトの生成
                var img = new Image();

                // データのオンロードをトリガーにする
                img.onload = function () {
                    // テクスチャオブジェクトの生成
                    var tex = gl.createTexture();

                    // テクスチャをバインドする
                    gl.bindTexture(gl.TEXTURE_2D, tex);

                    // テクスチャへイメージを適用
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

                    // ミップマップを生成
                    gl.generateMipmap(gl.TEXTURE_2D);

                    // テクスチャのバインドを無効化
                    gl.bindTexture(gl.TEXTURE_2D, null);

                    // 生成したテクスチャをグローバル変数に代入
                    texture = tex;
                };

                // イメージオブジェクトのソースを指定
                img.src = source;
            }
        }
    }
}