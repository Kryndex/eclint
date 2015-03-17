///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
var _ = require('lodash');
function check(context, settings, line) {
    var indentSize = resolveRule(settings);
    if (typeof indentSize === 'string') {
        return;
    }
    if (settings.indent_style === 'tab') {
        return;
    }
    var inferredSetting = infer(line);
    if (inferredSetting === 'tab') {
        return;
    }
    if (inferredSetting % indentSize !== 0) {
        context.report('Invalid indent size detected: ' + inferredSetting);
    }
}
function fix(settings, line) {
    var indentSize = resolveRule(settings);
    if (typeof indentSize !== 'number') {
        return line;
    }
    switch (settings.indent_style) {
        case 'tab':
            line.text = line.text.replace(/^ +/, function (match) {
                var indentLevel = Math.floor(match.length / indentSize);
                var extraSpaces = _.repeat(' ', match.length % indentSize);
                return _.repeat('\t', indentLevel) + extraSpaces;
            });
            break;
        case 'space':
            line.text = line.text.replace(/^\t+/, function (match) {
                return _.repeat(_.repeat(' ', indentSize), match.length);
            });
            break;
        default:
            return line;
    }
    return line;
}
function infer(line) {
    if (line.text[0] === '\t') {
        return 'tab';
    }
    var m = line.text.match(/^ +/);
    if (m) {
        var leadingSpacesLength = m[0].length;
        for (var i = 8; i > 0; i--) {
            if (leadingSpacesLength % i === 0) {
                return i;
            }
        }
    }
    return 0;
}
function resolveRule(settings) {
    if (settings.indent_size === 'tab') {
        return settings.tab_width;
    }
    return settings.indent_size;
}
var IndentSizeRule = {
    type: 'LineRule',
    check: check,
    fix: fix,
    infer: infer
};
module.exports = IndentSizeRule;
