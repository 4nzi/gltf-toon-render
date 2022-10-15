module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        library: {
            name: 'GLTFToonRender',
            export: 'default',
            type: 'umd',
        },
        filename: "gltf-toon-render.js"
    },
    devServer: {
        static: "./dist",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
            },
            {
                test: /.(vert|frag|glsl)$/,
                type: 'asset/source'
            },
        ]
    }
}