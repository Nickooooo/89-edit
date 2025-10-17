require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });

require(["vs/editor/editor.main"], function () {
  monaco.editor.defineTheme('faggot', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#191a1e' }
  });

  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: "-- book.club",
    language: "lua",
    theme: "faggot",
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    roundedSelection: false,
  });

  window.editor = editor;
});
