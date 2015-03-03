/**
 * @fileoverview Prevent usage of deprecated methods
 * @author Yannick Croissant
 */
'use strict';

var semver = require('semver');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = function(context) {

  // Validate React version passed in options (append the patch version if missing, allowing shorthands like 0.12 for React 0.12.0)
  var targetVersion = semver.valid(/^[0-9]+\.[0-9]+$/.test(context.options[0]) ? context.options[0] + '.0' : context.options[0]);

  var deprecated = {
    'memberExpression': {
      'React.renderComponent': ['>=0.12.0', 'React.render'],
      'React.renderComponentToString': ['>=0.12.0', 'React.renderToString'],
      'React.renderComponentToStaticMarkup': ['>=0.12.0', 'React.renderToStaticMarkup'],
      'React.isValidComponent': ['>=0.12.0', 'React.isValidElement'],
      'React.PropTypes.component': ['>=0.12.0', 'React.PropTypes.element'],
      'React.PropTypes.renderable': ['>=0.12.0', 'React.PropTypes.node'],
      'React.isValidClass': ['>=0.12.0'],
      'this.transferPropsTo': ['>=0.12.0', '{...}']
    }
  };

  function getFullMethodCall(node) {
    var method = [];
    do {
      method.unshift(node.property.name);
      node = node.object;
    } while (node.property);
    method.unshift(node.type === 'ThisExpression' ? 'this' : node.name);
    return method.join('.');
  }

  // --------------------------------------------------------------------------
  // Public
  // --------------------------------------------------------------------------

  return {

    'MemberExpression': function(node) {
      var method = getFullMethodCall(node);
      var alternative;
      if (deprecated.memberExpression[method] && semver.satisfies(targetVersion, deprecated.memberExpression[method][0])) {
        alternative = deprecated.memberExpression[method][1] ? ', use \'' + deprecated.memberExpression[method][1] + '\' instead' : '';
        context.report(node, '\'' + method + '\' is deprecated in React ' + deprecated.memberExpression[method][0] + alternative);
      }
    }

  };

};
