import { parseGLB } from "./parseGLB"
import { glUtils } from "./glUtils"
import { matIV, qtnIV } from "./minMatrix.js"
import Bone from "./bone.js"
import vertexShader from "./shaders/skin/vertexShader.glsl"
import fragmentShader from "./shaders/toon/fragmentShader.glsl"

export default class GLTFToonRender {
    constructor(canvas) {
        this.canvas = canvas
        this.meshes = []
        this.VAOs = []
        this.textures = []
        this.lightDirection = [-0.5, 0.5, 0.5]
    }

    setSize = (width, height) => {
        this.canvas.width = width
        this.canvas.height = height
    }

    setLight = (lightDirection) => {
        this.lightDirection = lightDirection
    }

    createArm = (skins) => {
        const root = new Bone(skins[0])
        let queue = []

        // task in queue
        skins.forEach(skin => {
            skin.children?.forEach(child_id => {
                queue.push({
                    current: skin.id,
                    children: child_id,
                })
            })
        })

        queue.forEach(elm => {
            const childBone = new Bone(skins.find(skin => skin.id == elm.children))
            const searchResult = []

            root.searchAll(searchResult, elm.current)
            searchResult[0].addChild(childBone)
        })

        console.log("------BoneNode-------")
        console.log(root)
        return root
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
            attLocation[3] = 3
            attLocation[4] = 4

            let attStride = []
            attStride[0] = 3
            attStride[1] = 3
            attStride[2] = 2
            attStride[3] = 4
            attStride[4] = 4

            // uniform
            let uniLocation = []
            uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix')
            uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix')
            uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection')
            uniLocation[3] = gl.getUniformLocation(prg, 'texture')

            // matrix
            const m = new matIV()
            const q = new qtnIV()

            let mMatrix = m.identity(m.create())
            let vMatrix = m.identity(m.create())
            let pMatrix = m.identity(m.create())
            let pvMatrix = m.identity(m.create())
            let mvpMatrix = m.identity(m.create())
            let invMatrix = m.identity(m.create())

            // View × projection 
            m.lookAt([0.0, 0.0, 10.0], [0, 0, 0], [0.0, 1.0, 0.0], vMatrix)
            m.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100, pMatrix)
            m.multiply(pMatrix, vMatrix, pvMatrix)

            this.meshes.forEach(mesh => {
                //VAO
                this.VAOs.push(createVAO(
                    [mesh.attributes.pos, mesh.attributes.nor, mesh.attributes.uv,
                    mesh.attributes.bon, mesh.attributes.wei],
                    attLocation,
                    attStride,
                    mesh.attributes.inx
                ))

                // texture
                let img = new Image()

                img.onload = () => {
                    let tex = gl.createTexture()

                    gl.bindTexture(gl.TEXTURE_2D, tex)
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
                    gl.generateMipmap(gl.TEXTURE_2D)
                    gl.bindTexture(gl.TEXTURE_2D, null)

                    this.textures.push(tex)
                }
                img.src = mesh.textures.albedo

                // skin
                const skins = mesh.skins
                const boneNode = this.createArm(skins)
                let bones = []


                boneNode.setJointMatrix()

                for (let i in skins) {
                    boneNode.searchJointInx(bones, i)
                }

                bones.forEach((bone, index) => {
                    uniLocation[4] = gl.getUniformLocation(prg, `bones[${index}]`)
                    gl.uniformMatrix4fv(uniLocation[4], false, bone)
                })
            })

            const render = () => {
                // clear
                gl.clearColor(0.3, 0.3, 0.3, 1.0)
                gl.clearDepth(1.0)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

                //matrix
                m.multiply(pvMatrix, mMatrix, mvpMatrix)

                // register uniform
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix)
                gl.uniformMatrix4fv(uniLocation[1], false, invMatrix)
                gl.uniform3fv(uniLocation[2], this.lightDirection)
                gl.uniform1i(uniLocation[3], 0)

                // bind and draw
                for (let i in this.meshes) {
                    gl.bindTexture(gl.TEXTURE_2D, this.textures[i])
                    gl.bindVertexArray(this.VAOs[i])

                    gl.drawElements(gl.TRIANGLES, this.meshes[i].attributes.inx.length, gl.UNSIGNED_SHORT, 0)
                }

                gl.flush()
                requestAnimationFrame(render)
            }

            render()
        }
    }
}