import { matIV, qtnIV } from "./minMatrix.js"

export default class Bone {
    constructor(skin) {
        const m = new matIV()
        const q = new qtnIV()

        this.id = skin.id
        this.jointInx = skin.jointInx
        this.parent = null
        this.children = []
        this.rotation = skin.rotation || [0, 0, 0, 1]

        this.matrix = m.identity(m.create())
        this.matrixComb = m.identity(m.create())
        this.matrixBone = m.identity(m.create())
        this.matrixInit = m.identity(m.create())
        this.matrixBind = skin.invMatrix

        m.translate(this.matrixInit, skin.position || [0, 0, 0], this.matrixInit)
        m.multiply(this.matrixBone, this.matrixInit, this.matrixBone)
        q.toMatIV(this.rotation, this.matrix)
        m.multiply(this.matrixBone, this.matrix, this.matrixBone)

    }

    addChild(childBone) {
        this.children.push(childBone)
        childBone.parent = this
    }

    getRoot() {
        if (this.parent == null) return this
        else return this.parent.getRoot()
    }

    searchChildren(result, id) {
        if (this.id == id) result.push(this)
        this.children?.forEach(child => child.searchChildren(result, id))
    }

    searchParents(result, id) {
        if (this.id == searchName) result.push(this)
        if (this.parent == null) return
        this.parent.searchParents(result, id)
    }

    searchAll(result, id) {
        const root = this.getRoot()
        root.searchChildren(result, id)
    }

    searchJointInx(result, jointInx) {
        if (this.jointInx == jointInx) return result.push(this.matrixComb)
        this.children?.forEach(child => child.searchJointInx(result, jointInx))
    }

    setJointMatrix() {
        const m = new matIV()

        if (this.parent) {
            m.multiply(this.parent.matrixBone, this.matrixBone, this.matrixBone)
            m.multiply(this.matrixBone, this.matrixBind, this.matrixComb)

            this.children?.forEach(child => child.setJointMatrix())

        } else {
            m.multiply(this.matrixBone, this.matrixBind, this.matrixComb)

            this.children?.forEach(child => child.setJointMatrix())
        }
    }
}