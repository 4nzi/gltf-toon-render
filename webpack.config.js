module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: `${__dirname}/dist`,
        filename: "gltf-toon-render.js",
    },
    devServer: {
        static: "./dist",
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)?$/,
            },
            {
                test: /.(vert|frag|glsl)$/,
                type: 'asset/source'
            },
        ]
    }
}