// custom file to extend prism.js which was downloaded from web
(function () {
  if (!window.Prism) {
    console.error("Prism not loaded");
    return;
  }

  /* ======================
     PYTHON CUSTOM KEYWORDS
     ====================== */

//   Prism.languages.insertBefore('python', 'keyword', {
//     'custom-keyword': {
//       pattern: /\b(?:MY_KEYWORD|ANOTHER_KEYWORD|DOMAIN_TERM)\b/,
//       alias: 'keyword'
//     }
//   });

  /* ======================
     SQL CUSTOM KEYWORDS
     ====================== */

//   Prism.languages.insertBefore('sql', 'keyword', {
//     'custom-keyword': {
//       pattern: /\b(?:UPSERT|MERGE|QUALIFY|WINDOW)\b/i,
//       alias: 'keyword'
//     }
//   });
  Prism.languages.insertBefore('sql', 'keyword', {
    'custom-keyword': {
      pattern: /\b(?:GROUPING|SETS|CUBE|MATERIALIZED|REFRESH)\b/i,
      alias: 'keyword'
    }
  });

})();
