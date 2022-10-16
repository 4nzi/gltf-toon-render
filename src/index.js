import { parseGLB } from "./gltf-parser"

export default class GLTFToonRender {
    constructor() {
        this.atributes = {}
    }

    loader = async (url) => {
        const reader = new FileReader()
        const res = await (await fetch(url)).blob()

        reader.readAsArrayBuffer(res)
        reader.onload = () => {
            const atributes = parseGLB(reader.result)
            Object.assign(this.atributes, atributes)
        }
    }
}