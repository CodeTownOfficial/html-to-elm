'use babel';

/* global atom */
/* jshint strict: false */

/*
 * Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
 *
 * To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
 * or `fdescribe`). Remove the `f` to unfocus the block.
 */

import HtmlToElm from '../lib/html-to-elm';

describe('HtmlToElm', () => {
  let editorView;
  let editor;

  beforeEach(() => {
    editorView = atom.views.getView(atom.workspace);

    waitsForPromise(() => {
      return atom.workspace.open('./sample.elm');
    });

    runs(() => {
      editor = atom.workspace.getActiveTextEditor();
      editorView = atom.views.getView(editor);
      HtmlToElm.activate();
    });

  });

  describe('when the html-to-elm:convert event is triggered', () => {
    it('convert the selected html to elm', () => {
      editor.setText(`<div class="todomvc-wrapper">
        <section id="todoapp">
          <h1>todos</h1>
          <input id="new-todo" placeholder="What to do you need?">
        </section>
        <section id="main">
          <input name="toggle" id="toggle-all" type="checkbox">
          <label for="toggle-all">Mark all as complete</label>
          <ul id="todo-list"></ul>
        </section>
      </div>`);

      editor.selectAll();
      atom.commands.dispatch(editorView, 'html-to-elm:convert');

      let expected = 'div\n' +
      '  [ class "todomvc-wrapper" ]\n' +
      '  [ section\n' +
      '    [ id "todoapp" ]\n' +
      '    [ h1\n' +
      '      []\n' +
      '      [ text "todos" ]\n' +
      '    , input\n' +
      '      [ id "new-todo", placeholder "What to do you need?" ]\n' +
      '      []\n' +
      '    ]\n' +
      '  , section\n' +
      '    [ id "main" ]\n' +
      '    [ input\n' +
      '      [ name "toggle", id "toggle-all", type\' "undefined" ]\n' +
      '      []\n' +
      '    , label\n' +
      '      [ for "toggle-all" ]\n' +
      '      [ text "Mark all as complete" ]\n' +
      '    , ul\n' +
      '      [ id "todo-list" ]\n' +
      '      []\n' +
      '    ]\n' +
      '  ]';

      expect(editor.getText()).toContain(expected);

    });
  });
});
