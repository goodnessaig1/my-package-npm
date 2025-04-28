import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" with { type: "json" };


const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: "src/index.tsx",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "GruveEventsWidget",
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        "react/jsx-runtime": "jsxRuntime", 
      },
      sourcemap: true,
    },
  ],
  external: ["react", "react-dom"],
  plugins: [
    external(),
    postcss(),
    resolve({ extensions }),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      clean: true,
    }),
    babel({
      extensions,
      babelHelpers: "bundled",
      // exclude: "node_modules/**",
      exclude: ["node_modules/**", "**/*.ts", "**/*.tsx"],
    }),
    terser(),
  ],
};


// import resolve from "@rollup/plugin-node-resolve";
// import commonjs from "@rollup/plugin-commonjs";
// import external from "rollup-plugin-peer-deps-external";
// import postcss from "rollup-plugin-postcss";
// import typescript from "rollup-plugin-typescript2";
// import { babel } from "@rollup/plugin-babel";
// import terser from "@rollup/plugin-terser";
// import pkg from "./package.json" with { type: "json" };


// const extensions = [".js", ".jsx", ".ts", ".tsx"];

// export default {
//   input: "src/index.tsx",
//   output: [
//     {
//       file: pkg.main,
//       format: "cjs",
//       exports: "named",
//       sourcemap: true,
//     },
//     {
//       file: pkg.module,
//       format: "es",
//       exports: "named",
//       sourcemap: true,
//     },
//     {
//       file: "dist/index.umd.js",
//       format: "umd",
//       name: "GruveEventsWidget",
//       globals: {
//         react: "React",
//         "react-dom": "ReactDOM",
//         "react/jsx-runtime": "jsxRuntime", 
//       },
//       sourcemap: true,
//     },
//   ],
//   external: ["react", "react-dom"],
//   plugins: [
//     external(),
//     postcss({
//   extract: true,
//   minimize: true,
//   sourceMap: true,
// })
// ,
//     resolve({ extensions }),
//     commonjs(),
//     typescript({
//       useTsconfigDeclarationDir: true,
//       clean: true,
//     }),
//     babel({
//       extensions,
//       babelHelpers: "bundled",
//       exclude: "node_modules/**",
//     }),
//     // terser(),
//   ],
// };