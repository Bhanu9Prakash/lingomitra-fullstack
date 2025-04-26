import { marked } from "marked";

export function markedConfig() {
  // Configure marked renderer
  const renderer = new marked.Renderer();
  
  // Customize table rendering
  renderer.table = function(header, body) {
    return `<div class="overflow-x-auto">
      <table class="w-full">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
  };
  
  // Customize blockquote rendering
  renderer.blockquote = function(quote) {
    return `<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-700 rounded">${quote}</blockquote>`;
  };
  
  // Customize code block rendering
  renderer.code = function(code, language) {
    return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4"><code class="language-${language}">${code}</code></pre>`;
  };
  
  // Apply custom renderer
  marked.use({ renderer });
  
  // Add custom classes
  marked.use({
    walkTokens(token) {
      if (token.type === 'heading') {
        switch (token.depth) {
          case 1:
            token.tokens = [{ type: 'text', raw: token.text, text: token.text, class: 'text-2xl font-bold mb-6' }];
            break;
          case 2:
            token.tokens = [{ type: 'text', raw: token.text, text: token.text, class: 'text-xl font-bold mb-4 text-primary dark:text-primary-light' }];
            break;
          case 3:
            token.tokens = [{ type: 'text', raw: token.text, text: token.text, class: 'text-lg font-bold mb-3' }];
            break;
        }
      }
    }
  });
  
  return marked;
}
