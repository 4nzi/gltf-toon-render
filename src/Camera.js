import Transform from "./Transform"
import { matIV } from "./utils/minMatrix.js"

const m = new matIV()

export class Camera {
    constructor(gl, fov, near, far) {
        this.pMatrix = m.identity(m.create())
        this.vMatrix = m.identity(m.create())
        this.transform = new Transform()
        this.mode = Camera.MODE_ORBIT

        m.perspective(fov || 30, gl.canvas.width / gl.canvas.height, near || 0.1, far || 100.0, this.pMatrix)
    }

    panX(vec) {
        if (this.mode == Camera.MODE_ORBIT) return

        this.updateViewMatrix()
        this.transform.position[0] += this.transform.right[12] * vec
        this.transform.position[1] += this.transform.right[13] * vec
        this.transform.position[2] += this.transform.right[14] * vec
    }

    panY(vec) {
        this.updateViewMatrix()
        this.transform.position[1] += this.transform.up[13] * vec

        if (this.mode == Camera.MODE_ORBIT) return

        this.transform.position[0] += this.transform.up[12] * vec
        this.transform.position[2] += this.transform.up[14] * vec
    }

    panZ(vec) {
        this.updateViewMatrix()

        if (this.mode == Camera.MODE_ORBIT) {
            this.transform.position[2] += vec

        } else {
            this.transform.position[0] += this.transform.forward[12] * vec
            this.transform.position[1] += this.transform.forward[13] * vec
            this.transform.position[2] += this.transform.forward[14] * vec
        }
    }

    updateViewMatrix() {
        if (this.mode == Camera.MODE_FREE) {
            m.identity(this.transform.matrix)
            m.translate(this.transform.matrix, this.transform.position, this.transform.matrix)
            m.rotate(this.transform.matrix, this.transform.rotation[0] * Transform.deg2Rad, [1.0, 0.0, 0.0], this.transform.matrix)
            m.rotate(this.transform.matrix, this.transform.rotation[1] * Transform.deg2Rad, [0.0, 1.0, 0.0], this.transform.matrix)

        } else {
            m.identity(this.transform.matrix)
            m.rotate(this.transform.matrix, this.transform.rotation[0] * Transform.deg2Rad, [1.0, 0.0, 0.0], this.transform.matrix)
            m.rotate(this.transform.matrix, this.transform.rotation[1] * Transform.deg2Rad, [0.0, 1.0, 0.0], this.transform.matrix)
            m.translate(this.transform.matrix, this.transform.position, this.transform.matrix)
        }

        this.transform.updateDirection()

        m.inverse(this.transform.matrix, this.vMatrix)

        return this.vMatrix
    }
}

Camera.MODE_FREE = 0
Camera.MODE_ORBIT = 1

export class CameraController {
    constructor(gl, camera) {
        let oThis = this
        let box = gl.canvas.getBoundingClientRect()

        this.canvas = gl.canvas
        this.camera = camera

        this.rotateRate = -300
        this.panRate = 5
        this.zoomRate = 200

        this.offsetX = box.left
        this.offsetY = box.top

        this.initX = 0
        this.initY = 0
        this.prevX = 0
        this.prevY = 0

        this.onUpHandler = function (e) { oThis.onMouseUp(e) }
        this.onMoveHandler = function (e) { oThis.onMouseMove(e) }

        this.canvas.addEventListener("mousedown", function (e) { oThis.onMouseDown(e) })
        this.canvas.addEventListener("mousewheel", function (e) { oThis.onMouseWheel(e) })
    }

    getMouseVec2(e) { return { x: e.pageX - this.offsetX, y: e.pageY - this.offsetY } }

    onMouseDown(e) {
        this.initX = this.prevX = e.pageX - this.offsetX
        this.initY = this.prevY = e.pageY - this.offsetY

        this.canvas.addEventListener("mouseup", this.onUpHandler)
        this.canvas.addEventListener("mousemove", this.onMoveHandler)
    }

    onMouseUp(e) {
        this.canvas.removeEventListener("mouseup", this.onUpHandler)
        this.canvas.removeEventListener("mousemove", this.onMoveHandler)
    }

    onMouseWheel(e) {
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
        this.camera.panZ(delta * (this.zoomRate / this.canvas.height))
    }

    onMouseMove(e) {
        var x = e.pageX - this.offsetX,
            y = e.pageY - this.offsetY,
            dx = x - this.prevX,
            dy = y - this.prevY;

        if (!e.shiftKey) {
            this.camera.transform.rotation[1] += dx * (this.rotateRate / this.canvas.width)
            this.camera.transform.rotation[0] += dy * (this.rotateRate / this.canvas.height)

        } else {
            this.camera.panX(-dx * (this.panRate / this.canvas.width))
            this.camera.panY(dy * (this.panRate / this.canvas.height))
        }

        this.prevX = x
        this.prevY = y
    }
}