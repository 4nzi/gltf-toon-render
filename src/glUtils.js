export const glUtils = (webglContext) => {
    const gl = webglContext

    const create_vertexShader = (raw) => {
        const shader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(shader, raw)
        gl.compileShader(shader)

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader
        } else {
            alert(gl.getShaderInfoLog(shader))
        }
    }

    const create_fragmentShader = (raw) => {
        const shader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(shader, raw)
        gl.compileShader(shader)

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader
        } else {
            alert(gl.getShaderInfoLog(shader))
        }
    }

    const create_program = (vs, fs) => {
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

    function create_vao(vboDataArray, attL, attS, iboData) {
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

    const create_texture = (source) => {
        var img = new Image()

        img.onload = function () {
            const tex = gl.createTexture()

            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
            gl.generateMipmap(gl.TEXTURE_2D)
            gl.bindTexture(gl.TEXTURE_2D, null)

            texture = tex
        }

        img.src = source
    }

    return {
        create_vertexShader,
        create_fragmentShader,
        create_program,
        create_vao,
        create_texture
    }
}
