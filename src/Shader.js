import glUtils from "./utils/glUtils"

class Shader {
    constructor(gl, vs, fs) {
        this.program = glUtils(gl).createProgramShader(vs, fs)
        this.gl = gl

        gl.useProgram(this.program)

        this.attLocation = glUtils(gl).getStandardAttLocations(this.program)
        this.uniformLoc = glUtils(gl).getStandardUniLocations(this.program)
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

    set(mvpMatrix, invMatrix, lightDirection) {
        this.gl.uniformMatrix4fv(this.uniformLoc.mvpMatrix, false, mvpMatrix)
        this.gl.uniformMatrix4fv(this.uniformLoc.invMatrix, false, invMatrix)
        this.gl.uniform3fv(this.uniformLoc.lightDirection, lightDirection)
        return this
    }

    //...................................................
    preRender() { }

    renderModel(model) {
        this.gl.bindVertexArray(model.vao)
        this.gl.drawElements(this.gl.TRIANGLES, model.attributes.inx.length, this.gl.UNSIGNED_SHORT, 0)
        this.gl.bindVertexArray(null)

        return this
    }
}

export default class TestShader extends Shader {
    constructor(gl, vs, fs) {
        super(gl, vs, fs)
    }

}