import typescript from "@rollup/plugin-typescript"

export default {
    input: "./src/index.ts",
    output: [
        //1.cjs->commonjs
        //2.esm
        {
            format: "cjs",
            file: "lib/mini-vue-guide.cjs.js",
        },
        {
            format: 'es',
            file: "lib/mini-vue-guide.esm.js",
        },
    ],
    plugins: [
        typescript()
    ],
}