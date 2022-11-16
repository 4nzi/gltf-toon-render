const ATTR_POSITION_NAME = "position"
const ATTR_POSITION_LOC = 0
const ATTR_POSITION_STR = 3
const ATTR_NORMAL_NAME = "normal"
const ATTR_NORMAL_LOC = 1
const ATTR_NORMAL_STR = 3
const ATTR_UV_NAME = "uv"
const ATTR_UV_LOC = 2
const ATTR_UV_STR = 2
const ATTR_WEIGHT_NAME = "weights"
const ATTR_WEIGHT_LOC = 3
const ATTR_WEIGHT_STR = 4
const ATTR_BONEIDX_NAME = "boneIdx"
const ATTR_BONEIDX_LOC = 4
const ATTR_BONEIDX_STR = 4

const glUtils = (webglContext) => {
    const gl = webglContext

    const createShader = (source, type) => {
        const shader = gl.createShader(type)

        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader))
            gl.deleteShader(shader)
            return null
        }

        return shader
    }

    const createProgram = (vs, fs) => {
        const program = gl.createProgram()

        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program))
            gl.deleteProgram(program)
            return null
        }

        gl.detachShader(program, vs)
        gl.detachShader(program, fs)
        gl.deleteShader(vs)
        gl.deleteShader(fs)

        return program
    }

    const createProgramShader = (vs, fs) => {
        const vShader = createShader(vs, gl.VERTEX_SHADER)
        const fShader = createShader(fs, gl.FRAGMENT_SHADER)

        return createProgram(vShader, fShader)
    }

    const createVAO = (pos, nor, uv, inx) => {
        let vao, vbo, ibo
        vao = gl.createVertexArray()

        gl.bindVertexArray(vao)

        //setup position
        if (pos) {
            vbo = gl.createBuffer()

            gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW)
            gl.enableVertexAttribArray(ATTR_POSITION_LOC)
            gl.vertexAttribPointer(ATTR_POSITION_LOC, ATTR_POSITION_STR, gl.FLOAT, false, 0, 0)

            vbo = null
        }

        //setup normal
        if (nor) {
            vbo = gl.createBuffer()

            gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nor), gl.STATIC_DRAW)
            gl.enableVertexAttribArray(ATTR_NORMAL_LOC)
            gl.vertexAttribPointer(ATTR_NORMAL_LOC, ATTR_NORMAL_STR, gl.FLOAT, false, 0, 0)

            vbo = null
        }

        //setup uv
        if (uv) {
            vbo = gl.createBuffer()

            gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW)
            gl.enableVertexAttribArray(ATTR_UV_LOC)
            gl.vertexAttribPointer(ATTR_UV_LOC, ATTR_UV_STR, gl.FLOAT, false, 0, 0)

            vbo = null
        }

        //setup inx
        if (inx) {
            ibo = gl.createBuffer()
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(inx), gl.STATIC_DRAW)
        }

        gl.bindVertexArray(null)
        return vao
    }

    const getStandardAttLocations = (program) => {
        return {
            position: gl.getAttribLocation(program, ATTR_POSITION_NAME),
            normal: gl.getAttribLocation(program, ATTR_NORMAL_NAME),
            uv: gl.getAttribLocation(program, ATTR_UV_NAME)
        }
    }

    const getStandardUniLocations = (program) => {
        return {
            mvpMatrix: gl.getUniformLocation(program, "mvpMatrix"),
            invMatrix: gl.getUniformLocation(program, "invMatrix"),
            lightDirection: gl.getUniformLocation(program, "lightDirection"),
        }
    }

    const loadTexture = (img) => {
        const tex = this.createTexture()

        this.bindTexture(this.TEXTURE_2D, tex);
        this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, img)

        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);					//Setup up scaling
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST);	//Setup down scaling
        this.generateMipmap(this.TEXTURE_2D);	//Precalc different sizes of texture for better quality rendering.

        this.bindTexture(this.TEXTURE_2D, null)
        return tex
    }

    return {
        createShader,
        createProgram,
        createProgramShader,
        createVAO,
        getStandardAttLocations,
        getStandardUniLocations,
        loadTexture
    }
}

export default glUtils
