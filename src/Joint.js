import { matIV, qtnIV } from "./utils/minMatrix.js"

const m = new matIV()
const q = new qtnIV()

export default class Joint {
    constructor(skin) {
        this.id = skin.id
        this.jointInx = skin.jointInx
        this.parent = null
        this.children = []
        this.isModified = false

        this.position = skin.position || [0, 0, 0]
        this.rotation = skin.rotation || [0, 0, 0, 1]

        this.localMat = m.identity(m.create())  // local = parent space coord
        this.worldMat = m.identity(m.create())  // world = parent.world * local
        this.bindMat = m.identity(m.create())   // inverse(world)
        this.diffMat = m.identity(m.create())
        this.compMat = m.identity(m.create())   // comp = parent.world * (local * diff) * bind
    }

    // skinning func
    setBindPose() {
        // calc local mat
        q.toMatIV(this.rotation, this.localMat)
        m.translate(this.localMat, this.position, this.localMat)

        // calc world mat
        if (this.parent) m.multiply(this.parent.worldMat, this.localMat, this.worldMat)
        else m.multiply(this.worldMat, this.localMat, this.worldMat)

        // calc bind mat
        m.inverse(this.worldMat, this.bindMat)
        this.children?.forEach(child => child.setBindPose())
    }

    setPose(diff) {
        m.identity(this.diffMat)
        m.multiply(this.diffMat, diff, this.diffMat)
        this.isModified = true
    }

    update() {
        if (this.isModified) {
            m.multiply(this.localMat, this.diffMat, this.localMat)
            this.isModified = false

            if (this.parent) m.multiply(this.parent.worldMat, this.localMat, this.worldMat)
            else m.multiply(this.worldMat, this.localMat, this.worldMat)

            m.multiply(this.worldMat, this.bindMat, this.compMat)
            this.children?.forEach(child => child.isModified = true)
        }

        this.children?.forEach(child => child.update())
    }

    // node operaiton func
    addChild(childBone) {
        this.children.push(childBone)
        childBone.parent = this
    }

    getRoot() {
        if (this.parent == null) return this
        else return this.parent.getRoot()
    }

    getFlatJointInx(result) {
        result[this.jointInx] = this
        this.children?.forEach(child => child.getFlatJointInx(result))
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
}