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

        gl.linkProgram(program);

        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program)

            return program;
        } else {
            alert(gl.getProgramInfoLog(program))
        }
    }

    const create_vbo = (data) => {
        const vbo = gl.createBuffer()

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        return vbo;
    }

    const set_attribute = (vbo, attL, attS) => {

        for (var i in vbo) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i])
            gl.enableVertexAttribArray(attL[i])
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0)
        }
    }

    const create_ibo = (data) => {
        const ibo = gl.createBuffer()

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

        return ibo
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
        create_vbo,
        set_attribute,
        create_ibo,
        create_texture
    }
}
