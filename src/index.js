import parseGLB from "./utils/parseGLB"
import glUtils from "./utils/glUtils"
import Model from "./Model"
import TestShader from "./Shader.js"
import { matIV, qtnIV } from "./utils/minMatrix.js"
import vToon from "./shaders/toon/vertexShader.glsl"
import fToon from "./shaders/toon/fragmentShader.glsl"

export default class GLTFToonRender {
    constructor(canvas) {
        this.canvas = canvas
        this.models = []
        this.textures = []
        this.shaders = []
        this.lightDirection = [-0.5, 0.5, 0.5]
    }

    setSize(width, height) {
        this.canvas.width = width
        this.canvas.height = height
    }

    setLight(lightDirection) {
        this.lightDirection = lightDirection
    }

    getModel(gl, loadedGLB) {
        const meshes = parseGLB(loadedGLB)

        meshes.forEach(mesh => {
            const vao = glUtils(gl).createVAO(mesh.attributes.pos,
                mesh.attributes.nor, mesh.attributes.uv, mesh.attributes.inx
            )

            this.models.push(new Model(mesh.attributes, vao))
        })
    }

    async loadGLB(url) {
        const reader = new FileReader()
        const res = await (await fetch(url)).blob()

        reader.readAsArrayBuffer(res)
        reader.onload = async () => {
            const gl = this.canvas.getContext('webgl2')

            //get model and shader
            this.getModel(gl, reader.result)
            const testShader = new TestShader(gl, vToon, fToon)

            // setting
            gl.enable(gl.DEPTH_TEST)
            gl.depthFunc(gl.LEQUAL)
            gl.enable(gl.CULL_FACE)

            // matrix
            const m = new matIV()
            const q = new qtnIV()

            let mMatrix = m.identity(m.create())
            let vMatrix = m.identity(m.create())
            let pMatrix = m.identity(m.create())
            let pvMatrix = m.identity(m.create())
            let mvpMatrix = m.identity(m.create())
            let invMatrix = m.identity(m.create())

            // model x view × projection 
            m.lookAt([0.0, 0.0, 10.0], [0, 0, 0], [0.0, 1.0, 0.0], vMatrix)
            m.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100, pMatrix)
            m.multiply(pMatrix, vMatrix, pvMatrix)
            m.multiply(pvMatrix, mMatrix, mvpMatrix)

            const render = () => {
                // clear
                gl.clearColor(0.3, 0.3, 0.3, 1.0)
                gl.clearDepth(1.0)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

                // bind and draw
                this.models.forEach(model => {
                    testShader.activate()
                        .set(mvpMatrix, invMatrix, this.lightDirection).renderModel(model)
                })

                gl.flush()
                requestAnimationFrame(render)
            }

            render()
        }
    }
}