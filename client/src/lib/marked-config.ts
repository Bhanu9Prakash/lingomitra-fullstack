import { marked } from "marked";

export function markedConfig() {
  // Create a simple marked configuration that focuses on basic rendering
  // without any complex TypeScript typing issues
  const renderer = new marked.Renderer();
  
  // Override the default renderer with simple logic
  marked.use({ 
    gfm: true, 
    breaks: true,
  });
  
  return marked;
}
