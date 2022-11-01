import { parseGLB } from "./parseGLB"
import { glUtils } from "./glUtils"
import { matIV, qtnIV } from "./minMatrix.js"
import vertexShader from "./shaders/simple/vertexShader.glsl"
import fragmentShader from "./shaders/simple/fragmentShader.glsl"

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
        reader.onload = () => {
            this.meshes = parseGLB(reader.result)
            const gl = this.canvas.getContext('webgl2')
            const {
                create_vertexShader,
                create_fragmentShader,
                create_program,
                create_vao,
            } = glUtils(gl)

            // setting
            gl.clearColor(0.0, 0.0, 1.0, 1.0)
            gl.clearDepth(1.0)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

            // shader
            const v_shader = create_vertexShader(vertexShader)
            const f_shader = create_fragmentShader(fragmentShader)
            const prg = create_program(v_shader, f_shader)

            // attribute
            let attLocation = []
            attLocation[0] = 0

            let attStride = []
            attStride[0] = 3

            for (let i in this.meshes) {
                this.VAOs.push(create_vao(
                    [this.meshes[i].pos],
                    attLocation,
                    attStride,
                    this.meshes[i].inx
                ))
            }

            // uniform
            let uniLocation = []
            uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix')

            // matrix
            const m = new matIV()
            let mMatrix = m.identity(m.create())
            let vMatrix = m.identity(m.create())
            let pMatrix = m.identity(m.create())
            let vpMatrix = m.identity(m.create())
            let mvpMatrix = m.identity(m.create())

            m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix)
            m.perspective(90, this.canvas.width / this.canvas.height, 0.1, 100, pMatrix)
            m.multiply(pMatrix, vMatrix, vpMatrix)
            m.translate(mMatrix, [0.0, 0.0, 0.0], mMatrix)
            m.multiply(vpMatrix, mMatrix, mvpMatrix)

            // render
            for (let i in this.meshes) {
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix)
                gl.bindVertexArray(this.VAOs[i])
                gl.drawElements(gl.TRIANGLES, this.meshes[i].inx.length, gl.UNSIGNED_SHORT, 0)
            }
        }
    }
}