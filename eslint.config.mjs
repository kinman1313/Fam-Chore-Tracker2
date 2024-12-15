import globals from "globals";
import pluginJs from "@eslint/js";
<<<<<<< HEAD
=======
import tseslint from "typescript-eslint";
>>>>>>> fam-chore-tracker2-new
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
<<<<<<< HEAD
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
=======
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
>>>>>>> fam-chore-tracker2-new
  pluginReact.configs.flat.recommended,
];