'use babel';

/* global atom */
/* jshint strict: false */

import htmlparser from 'htmlparser2';
import { CompositeDisposable } from 'atom';

const INDENT_SIZE = 2;

function indentation(depth) {
  return ' '.repeat(depth * INDENT_SIZE);
}

function trim(str) {
  return str.replace(/^[\n\t ]+|[\n\t ]+$/g, '');
}

function convertHtml(input) {
  let result = '';
  let depth = -1;
  let context = [];

  let parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
      let pre = '';
      let tag = [];

      depth++;

      // Add a coma if there is already a tag at the same depth with the same
      // parent
      if (context[depth]) {
        pre = '\n' + indentation(depth) + ',';
      } else {
        context[depth] = true;
      }

      // Add space before html tag
      pre += ((depth) ? ' ' : '');

      // Get all attributes
      let attrs = Object.keys(attribs).map((attrKey) => {
        if (attrKey === 'type') {
          attrKey = 'type\'';
        }
        return attrKey + ' "' + attribs[attrKey] + '"';
      });


      // Add all element into the tag array
      tag.push(pre + name);
      tag.push('\n' + indentation(depth + 1) + '[');

      if (attrs.length) {
        tag.push(
          ' ' + attrs.join(', ') + ' '
        );
      }

      tag.push(']\n' + indentation(depth + 1) + '[');

      // Create a string from the tag array
      result += tag.join('');
    },

    ontext: function(rawText){
      // Remove blank chars
      let text = trim(rawText);

      // Add text function if there is still some text
      if (text.length) {
        result += ` text "${text}" `;
      }
    },

    onclosetag: function(name) {
      // Update context array
      if (context[depth + 1]) {
        delete context[depth + 1];

        // Add a return and indentation if other tags are at the level
        result += '\n' + indentation(depth + 1);
      }

      depth--;

      // Close
      result += ']';
    }
  }, { decodeEntities: true });

  parser.write(input);
  parser.end();

  return result;
}

module.exports = {
  subscription: null,

  activate: function() {
    this.subscription = new CompositeDisposable();

    return this.subscription.add(
      atom.commands.add(
        'atom-workspace',
        {
          'html-to-elm:convert': this.convert.bind(this)
        }
      )
    );
  },

  deactivate: function () {
    return this.subscriptions.dispose();
  },

  convert: function() {
    let editor = atom.workspace.getActiveTextEditor();
    let selection = editor.getLastSelection();
    let html = selection.getText();
    let elm = convertHtml(html);

    selection.insertText(elm);
  }
};
