import { marked } from "marked";

export function markedConfig() {
  // Configure marked renderer
  const renderer = new marked.Renderer();
  
  // Customize table rendering
  renderer.table = function(header, body) {
    return `<div class="table-container">
      <table>
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
  };
  
  // Customize blockquote rendering
  renderer.blockquote = function(quote) {
    return `<blockquote>${quote}</blockquote>`;
  };
  
  // Customize code block rendering
  renderer.code = function(code, language) {
    return `<pre><code class="language-${language}">${code}</code></pre>`;
  };
  
  // Customize headings
  renderer.heading = function(text, level) {
    return `<h${level}>${text}</h${level}>`;
  };
  
  // Customize paragraph
  renderer.paragraph = function(text) {
    return `<p>${text}</p>`;
  };
  
  // Customize lists
  renderer.list = function(body, ordered) {
    const type = ordered ? 'ol' : 'ul';
    return `<${type}>${body}</${type}>`;
  };
  
  // Apply custom renderer
  marked.use({ renderer });
  
  return marked;
}
