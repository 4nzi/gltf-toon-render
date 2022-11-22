import parseGLB from "./utils/parseGLB"
import Model from "./Model"
import { Camera, CameraController } from "./Camera"
import ToonShader from "./Shader"
import vToon from "./shaders/toon/vertexShader.glsl"
import fToon from "./shaders/toon/fragmentShader.glsl"
import vNormal from "./shaders/normal/vertexShader.glsl"
import fNormal from "./shaders/normal/fragmentShader.glsl"

export default class GLTFToonRender {
    constructor(canvas) {
        this.canvas = canvas
        this.models = []
        this.shaders = []
        this.lightDirection = [0.5, 0.5, -0.1]
        this.isActive = true
    }

    setSize(width, height) {
        this.canvas.width = width
        this.canvas.height = height
    }

    setLight(lightDirection) { this.lightDirection = lightDirection }

    start() { this.isActive = true }

    stop() { this.isActive = false }

    async loadGLB(src) {
        const reader = new FileReader()
        const res = await (await fetch(src)).blob()

        reader.readAsArrayBuffer(res)
        reader.onload = async () => {
            const gl = this.canvas.getContext('webgl2')
            const meshes = parseGLB(reader.result)

            // setup model x camera x shader
            for (let i in meshes) {
                const model = new Model(meshes[i].attributes, gl)
                await model.loadTexture(meshes[i].textures)

                this.models.push(model)
            }

            const camera = new Camera(gl)
            const CameraCtrl = new CameraController(gl, camera)
            camera.transform.position = [0.0, 0.0, 9.0]

            const toonShader = new ToonShader(gl, vToon, fToon)
            toonShader.activate().setPmatrix(camera.pMatrix).deactivate()

            const normalShader = new ToonShader(gl, vNormal, fNormal)
            normalShader.activate().setPmatrix(camera.pMatrix).deactivate()

            // setting
            gl.enable(gl.DEPTH_TEST)
            gl.depthFunc(gl.LEQUAL)
            gl.enable(gl.CULL_FACE)

            // render
            const render = () => {
                camera.updateViewMatrix()

                // clear
                gl.clearColor(0.3, 0.3, 0.3, 1.0)
                gl.clearDepth(1.0)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

                // draw models
                this.models.forEach(model => {
                    if (model.texture.normal) {
                        normalShader.activate().setAlbedoTexture(model.texture.albedo).setNormalTexture(model.texture.normal).preRender()
                            .setVmatrix(camera.vMatrix)
                            .setLightDirection(this.lightDirection)
                            .renderModel(model.setScale(1.5, 1.5, 1.5).preRender())

                    } else {
                        toonShader.activate().setAlbedoTexture(model.texture.albedo).preRender()
                            .setVmatrix(camera.vMatrix)
                            .setLightDirection(this.lightDirection)
                            .renderModel(model)
                    }
                })
                gl.flush()

                if (this.isActive) requestAnimationFrame(render)
            }
            render()
            console.log("---------shader--------")
            console.log(normalShader)
            console.log(this.models)
            console.log(camera)
        }
    }
}