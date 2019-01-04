
exports.default = {
    /**
     * Logical NOT of any expression.
     * @example
     *      {{not true}}    => false
     *      {{not false}}   => true
     *
     * @param expression
     * @returns boolean
     */
    not: function(expression) {
        return !expression;
    },

};