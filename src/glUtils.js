export const glUtils = (webglContext) => {
    const gl = webglContext

    const createVertexShader = (raw) => {
        const shader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(shader, raw)
        gl.compileShader(shader)

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader
        } else {
            alert(gl.getShaderInfoLog(shader))
        }
    }

    const createFragmentShader = (raw) => {
        const shader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(shader, raw)
        gl.compileShader(shader)

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader
        } else {
            alert(gl.getShaderInfoLog(shader))
        }
    }

    const createProgram = (vs, fs) => {
        const program = gl.createProgram()

        gl.attachShader(program, vs)
        gl.attachShader(program, fs)

        gl.linkProgram(program)

        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program)

            return program
        } else {
            alert(gl.getProgramInfoLog(program))
        }
    }

    function createVAO(vboDataArray, attL, attS, iboData) {
        let vao, vbo, ibo, i
        vao = gl.createVertexArray()
        gl.bindVertexArray(vao)
        for (i in vboDataArray) {
            vbo = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vboDataArray[i]), gl.STATIC_DRAW)
            gl.enableVertexAttribArray(attL[i])
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0)
        }
        if (iboData) {
            ibo = gl.createBuffer()
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(iboData), gl.STATIC_DRAW)
        }
        gl.bindVertexArray(null)
        return vao
    }

    return {
        createVertexShader,
        createFragmentShader,
        createProgram,
        createVAO
    }
}
