import resolve from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";
import terser from "@rollup/plugin-terser";
import * as sass from "sass";
import path from "node:path";
import packageJson from "./package.json" with { type: "json" };

const root = path.resolve();

// Dependencies and peers stay external: consumers install them (react, lucide-react).
const externalPackages = [
  ...Object.keys(packageJson.peerDependencies ?? {}),
  ...Object.keys(packageJson.dependencies ?? {}),
];
const external = (id) => externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

export default [
  {
    input: "src/index.ts",
    external,
    output: [
      { file: packageJson.main, format: "cjs", sourcemap: true, exports: "named" },
      { file: packageJson.module, format: "esm", sourcemap: true },
    ],
    plugins: [
      alias({
        entries: [{ find: /^\/@\//, replacement: `${path.resolve(root, "src")}/` }],
      }),
      resolve({ extensions: [".mjs", ".js", ".ts", ".tsx", ".json", ".scss"] }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.build.json", declaration: false, emitDeclarationOnly: false, declarationDir: undefined, rootDir: "./src" }),
      postcss({
        minimize: true,
        include: /\.module\.scss$/,
        extensions: [".scss"],
        modules: {
          localsConvention: "camelCaseOnly",
          generateScopedName: "sf-[name]__[local]___[hash:base64:5]",
        },
        use: [
          [
            "sass",
            {
              implementation: sass,
              includePaths: [path.resolve(root, "src/core/styles")],
              silenceDeprecations: ["legacy-js-api"],
            },
          ],
        ],
        extract: "module.css",
        sourceMap: true,
      }),
      terser(),
    ],
  },
  {
    input: "dist/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts({ tsconfig: "./tsconfig.build.json" })],
    external: [/\.(css|less|scss)$/, ...externalPackages.map((p) => new RegExp(`^${p}`))],
  },
];
