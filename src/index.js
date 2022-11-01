import { parseGLB } from "./parseGLB"
import { glUtils } from "./glUtils"
import { matIV, qtnIV } from "./minMatrix.js"
import vertexShader from "./shaders/toon/vertexShader.glsl"
import fragmentShader from "./shaders/toon/fragmentShader.glsl"

export default class GLTFToonRender {
    constructor(canvas) {
        this.canvas = canvas
        this.meshes = []
        this.VAOs = []
        this.lightDirection = [-0.5, 0.5, 0.5]
        this.rotate = 0
    }

    setSize = (width, height) => {
        this.canvas.width = width
        this.canvas.height = height
    }

    setLight = (lightDirection) => {
        this.lightDirection = lightDirection
    }

    loadGLB = async (url) => {
        const reader = new FileReader()
        const res = await (await fetch(url)).blob()

        reader.readAsArrayBuffer(res)
        reader.onload = async () => {
            this.meshes = parseGLB(reader.result)
            const gl = this.canvas.getContext('webgl2')
            const {
                createVertexShader,
                createFragmentShader,
                createProgram,
                createVAO
            } = glUtils(gl)

            // setting
            gl.enable(gl.DEPTH_TEST)
            gl.depthFunc(gl.LEQUAL)
            gl.enable(gl.CULL_FACE)

            // shader
            const v_shader = createVertexShader(vertexShader)
            const f_shader = createFragmentShader(fragmentShader)
            const prg = createProgram(v_shader, f_shader)

            // attribute
            let attLocation = []
            attLocation[0] = 0
            attLocation[1] = 1
            attLocation[2] = 2

            let attStride = []
            attStride[0] = 3
            attStride[1] = 3
            attStride[2] = 2

            for (let i in this.meshes) {
                this.VAOs.push(createVAO(
                    [this.meshes[i].pos, this.meshes[i].nor, this.meshes[i].uv],
                    attLocation,
                    attStride,
                    this.meshes[i].inx
                ))
            }

            // uniform
            let uniLocation = []
            uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix')
            uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix')
            uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection')
            uniLocation[3] = gl.getUniformLocation(prg, 'texture')

            // matrix
            const m = new matIV()
            let mMatrix = m.identity(m.create())
            let vMatrix = m.identity(m.create())
            let pMatrix = m.identity(m.create())
            let vpMatrix = m.identity(m.create())
            let mvpMatrix = m.identity(m.create())
            let invMatrix = m.identity(m.create())

            m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix)
            m.perspective(90, this.canvas.width / this.canvas.height, 0.1, 100, pMatrix)
            m.multiply(pMatrix, vMatrix, vpMatrix)
            m.translate(mMatrix, [0.0, 0.0, 0.0], mMatrix)
            m.multiply(vpMatrix, mMatrix, mvpMatrix)

            // texture
            let textures = []

            gl.activeTexture(gl.TEXTURE0)
            for (let i in this.meshes) {
                let img = new Image()

                img.onload = () => {
                    let tex = gl.createTexture()

                    gl.bindTexture(gl.TEXTURE_2D, tex)
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
                    gl.generateMipmap(gl.TEXTURE_2D)
                    gl.bindTexture(gl.TEXTURE_2D, null)

                    textures.push(tex)
                }
                img.src = this.meshes[i].tex
            }

            const render = () => {
                // clear
                gl.clearColor(0.3, 0.3, 0.3, 1.0)
                gl.clearDepth(1.0)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

                // register uniform
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix)
                gl.uniformMatrix4fv(uniLocation[1], false, invMatrix)
                gl.uniform3fv(uniLocation[2], this.lightDirection)
                gl.uniform1i(uniLocation[3], 0)

                // bind and draw
                for (let i in this.meshes) {
                    gl.bindTexture(gl.TEXTURE_2D, textures[i])
                    gl.bindVertexArray(this.VAOs[i])

                    gl.drawElements(gl.TRIANGLES, this.meshes[i].inx.length, gl.UNSIGNED_SHORT, 0)
                }

                gl.flush()
                requestAnimationFrame(render)
            }
            render()
        }
    }
}