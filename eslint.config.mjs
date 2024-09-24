import globals from "globals";
import js from "@eslint/js";

export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jquery,
            },

            ecmaVersion: "latest",
            sourceType: "commonjs",
        },

        rules: {
            ...js.configs.recommended.rules,

            indent: ["warn", 4, {
                SwitchCase: 1,
            }],

            "no-multi-spaces": ["warn", {
                ignoreEOLComments: true,
            }],

            quotes: ["warn", "double"],
            "max-len": ["off"],
            camelcase: ["off"],
            "no-plusplus": ["off"],
            "prefer-template": ["off"],
            "func-names": ["warn", "as-needed"],
            "one-var-declaration-per-line": ["off"],
            "wrap-iife": ["warn", "inside"],
            "import/no-unresolved": ["off"],

            "no-multiple-empty-lines": ["warn", {
                max: 3,
                maxEOF: 1,
                maxBOF: 3,
            }],

            "spaced-comment": ["off"],
            "object-shorthand": ["warn", "consistent"],
            "padded-blocks": ["off"],
            "key-spacing": ["off"],
            "object-curly-spacing": ["warn"],
            "eol-last": ["warn"],

            "no-labels": ["warn", {
                allowLoop: true,
                allowSwitch: true,
            }],
        },

        ignores: ["src/js/vendor/*"],

}];