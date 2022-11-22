import glUtils from "./utils/glUtils"

class Shader {
    constructor(gl, vs, fs) {
        this.program = glUtils(gl).createProgramShader(vs, fs)
        this.gl = gl

        gl.useProgram(this.program)
        this.attLocation = glUtils(gl).getStandardAttLocations(this.program)
        this.uniLocation = glUtils(gl).getStandardUniLocations(this.program)
        this.texLocation = {}
    }

    activate() {
        this.gl.useProgram(this.program)
        return this
    }

    deactivate() {
        this.gl.useProgram(null)
        return this
    }

    dispose() {
        if (this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null)
        this.gl.deleteProgram(this.program)
    }

    setMmatrix(mat) { this.gl.uniformMatrix4fv(this.uniLocation.mMatrix, false, mat); return this }
    setVmatrix(mat) { this.gl.uniformMatrix4fv(this.uniLocation.vMatrix, false, mat); return this }
    setPmatrix(mat) { this.gl.uniformMatrix4fv(this.uniLocation.pMatrix, false, mat); return this }

    setLightDirection(matData) { this.gl.uniform3fv(this.uniLocation.lightDirection, matData); return this }
    setInvMatrix(matData) { this.gl.uniformMatrix4fv(this.uniLocation.invMatrix, false, matData); return this }

    //...................................................
    preRender() { }

    renderModel(model) {
        //register uniform
        this.setMmatrix(model.transform.getMatrix())
        this.setInvMatrix(model.transform.getInvMatrix())

        //draw
        this.gl.bindVertexArray(model.vao)
        this.gl.drawElements(this.gl.TRIANGLES, model.attributes.inx.length, this.gl.UNSIGNED_SHORT, 0)
        this.gl.bindVertexArray(null)

        return this
    }
}

export default class ToonShader extends Shader {
    constructor(gl, vs, fs) {
        super(gl, vs, fs)

        //custom uniforms 
        this.uniLocation.edge = gl.getUniformLocation(this.program, "edge")
        this.texLocation.albedoTex = gl.getUniformLocation(this.program, "albedoTex")
        this.texLocation.normalTex = gl.getUniformLocation(this.program, "normalTex")

        //store texture 
        this.texture = {
            albebo: null,
            normal: null
        }
    }

    setAlbedoTexture(tex) { this.texture.albebo = tex; return this; }
    setNormalTexture(tex) { this.texture.normal = tex; return this; }

    //...................................................
    preRender() {
        // setup texture
        if (this.texture.albebo) {
            this.gl.activeTexture(this.gl.TEXTURE0)
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.albebo)
            this.gl.uniform1i(this.texLocation.albedoTex, 0)
        }

        if (this.texture.normal) {
            this.gl.activeTexture(this.gl.TEXTURE1)
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.normal)
            this.gl.uniform1i(this.texLocation.normalTex, 1)
        }

        return this
    }

    renderModel(model) {
        // register matrix
        this.setMmatrix(model.transform.getMatrix())
        this.setInvMatrix(model.transform.getInvMatrix())

        // bind and draw
        this.gl.bindVertexArray(model.vao)

        // model
        this.gl.cullFace(this.gl.BACK)
        this.gl.uniform1i(this.uniLocation.edge, false);
        this.gl.drawElements(this.gl.TRIANGLES, model.attributes.inx.length, this.gl.UNSIGNED_SHORT, 0)

        // edge
        this.gl.cullFace(this.gl.FRONT)
        this.gl.uniform1i(this.uniLocation.edge, true)
        this.gl.drawElements(this.gl.TRIANGLES, model.attributes.inx.length, this.gl.UNSIGNED_SHORT, 0)

        this.gl.bindVertexArray(null)
    }
}

class SkinShader extends ToonShader {
    constructor(gl, vs, fs) {
        super(gl, vs, fs)

        //custom attribute 
        this.attLocation.weights = this.attLocation.weights = gl.getAttribLocation(this.program, "weights")
        this.attLocation.boneIdx = this.attLocation.boneIdx = gl.getAttribLocation(this.program, "boneIdx")

        //custom uniforms 
        this.uniLocation.bones = gl.getUniformLocation(this.program, "bones")
    }

    //...................................................
    preRender() {
        super.preRender()

    }
}