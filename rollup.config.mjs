import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" with { type: "json" };
import replace from "@rollup/plugin-replace";


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
    // "react/jsx-runtime": "jsxRuntime", 
    
"react-dom/client": "ReactDOM", // ✅ Add this line
      "react/jsx-runtime": "jsxRuntime",

  },
  sourcemap: true,
}

    // {
    //   file: "dist/index.umd.js",
    //   format: "umd",
    //   name: "GruveEventsWidget",
    //   globals: {
    //     react: "React",
    //     "react-dom": "ReactDOM",
    //     "react/jsx-runtime": "jsxRuntime", 
    //   },
    //   sourcemap: true,
    // },
  ],
  // external: ["react", "react-dom"],
  external: ["react", "react-dom", "react-dom/client"],

  plugins: [
    external(),
    postcss({


extract: false, // ✅ Inline styles into JS
  modules: {
    generateScopedName: "[name]__[local]___[hash:base64:5]",
  },
  minimize: true,


// extract: false, // ⬅️ This inlines the CSS into the JS bundle
//   modules: {
//     generateScopedName: "[name]__[local]___[hash:base64:5]",
//   },
//   minimize: true, 

      //        extract: 'gruve-widgets.css', // Writes all styles to this CSS file in /dist
  
      
// modules: {
//     generateScopedName: "[name]__[local]___[hash:base64:5]",
//   },

      // modules: {
      //   generateScopedName: "[name]__[local]___[hash:base64:5]",
      // },
    }),
    resolve( { extensions } ),
    
replace({
  preventAssignment: true,
  "process.env.NODE_ENV": JSON.stringify("production"),
}),

    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      clean: true,
    }),
    babel({
  extensions,
  babelHelpers: "bundled",
  exclude: ["node_modules/**"],
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "classic", // 👈 force classic runtime
      },
    ],
    "@babel/preset-typescript",
  ],
}),

    terser(),
  ],
};
