import path from "path";
import Dotenv from "dotenv-webpack";
import TerserPlugin from "terser-webpack-plugin";
import WebpackObfuscator from "webpack-obfuscator";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.ts",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin()],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new Dotenv({ path: `./.env${isProduction ? ".production" : ""}`}),
      ...(
        isProduction ? [
          new WebpackObfuscator(
            { rotateStringArray: true },
            ["excluded_bundle_name.js"]
          )
        ] : []
      ),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "./dist/main.js",
            to: path.resolve(__dirname, "wp-plugin", "js"),
            force: true,
          },
        ],
      }),
    ],
  }
};
