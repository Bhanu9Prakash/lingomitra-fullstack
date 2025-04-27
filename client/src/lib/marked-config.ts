import { marked } from "marked";

export function markedConfig() {
  // Use Marked's setOptions method to apply custom rendering
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    breaks: true
  });

  // Configure marked renderer
  const renderer = {
    // Marked expects different parameters in v4+ but works with these
    table(header: string, body: string) {
      return `<div class="table-container">
        <table>
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
    },
  
    blockquote(quote: string) {
      return `<blockquote>${quote}</blockquote>`;
    },
  
    code(code: string, language: string) {
      return `<pre><code class="language-${language}">${code}</code></pre>`;
    },
  
    heading(text: string, level: number) {
      return `<h${level}>${text}</h${level}>`;
    },
  
    paragraph(text: string) {
      return `<p>${text}</p>`;
    },
  
    list(body: string, ordered: boolean) {
      const type = ordered ? 'ol' : 'ul';
      return `<${type}>${body}</${type}>`;
    }
  };
  
  // Apply custom renderer
  marked.use({ renderer });
  
  return marked;
}
