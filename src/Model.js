import glUtils from "./utils/glUtils"
import Transform from "./Transform"

export default class Model {
    constructor(att, gl) {
        this.attributes = att
        this.gl = gl
        this.vao = glUtils(this.gl).createVAO(
            this.attributes.pos,
            this.attributes.nor,
            this.attributes.uv,
            this.attributes.inx
        )

        this.texture = {
            albedo: null,
            normal: null,
        }

        this.transform = new Transform()   // include model matrix
    }

    async loadTexture(tex) {
        if (tex.albedo) await glUtils(this.gl).loadTexture(tex.albedo).then(res => this.texture.albedo = res)
        if (tex.normal) await glUtils(this.gl).loadTexture(tex.normal).then(res => this.texture.normal = res)
    }

    // transform operation
    setScale(x, y, z) { this.transform.scale = [x, y, z]; return this }
    setPosition(x, y, z) { this.transform.position = [x, y, z]; return this }
    setRotation(x, y, z) { this.transform.rotation = [x, y, z]; return this }

    addScale(x, y, z) { this.transform.scale[0] += x; this.transform.scale[1] += y; this.transform.scale[2] += z; return this }
    addPosition(x, y, z) { this.transform.position[0] += x; this.transform.position[1] += y; this.transform.position[2] += z; return this }
    addRotation(x, y, z) { this.transform.rotation[0] += x; this.transform.rotation[1] += y; this.transform.rotation[2] += z; return this }

    // preRender
    preRender() { this.transform.updateMatrix(); return this }
}