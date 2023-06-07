/**
 * Logical NOT of any expression.
 * @example
 *      {{not true}}    => false
 *      {{not false}}   => true
 *
 * @param expression
 * @returns boolean
 */

const not = function (expression) {
    return !expression;
};

module.exports = not;