import { useState, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownEditor({ value, onChange, placeholder, rows = 15 }: MarkdownEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const uploadImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/blog/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const insertImageMarkdown = useCallback((imageUrl: string, altText: string = 'image') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const imageMarkdown = `![${altText}](${imageUrl})`;
    
    const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
    onChange(newValue);

    // Set cursor position after the inserted markdown
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
    }, 0);
  }, [value, onChange]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      console.warn('No image files found in selection');
      return;
    }

    for (const file of imageFiles) {
      try {
        const imageUrl = await uploadImage(file);
        const altText = file.name.replace(/\.[^/.]+$/, ''); // Remove extension for alt text
        insertImageMarkdown(imageUrl, altText);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
  }, [uploadImage, insertImageMarkdown]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));

    if (imageItems.length > 0) {
      e.preventDefault();
      
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
          try {
            const imageUrl = await uploadImage(file);
            const altText = `pasted-image-${Date.now()}`;
            insertImageMarkdown(imageUrl, altText);
          } catch (error) {
            console.error('Failed to upload pasted image:', error);
          }
        }
      }
    }
  }, [uploadImage, insertImageMarkdown]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Content (Markdown)</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Images'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div
            className={`relative ${isDragging ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              rows={rows}
              placeholder={placeholder || "Write your blog post content in Markdown...\n\nTip: You can drag & drop images or paste them directly!"}
              className="font-mono text-sm resize-none"
              required
            />
            
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Drop images here</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            <p>Supports: Drag & drop images, paste from clipboard, or click upload button</p>
            <p>Markdown shortcuts: **bold** *italic* `code` {'>'} quote</p>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary/20 pl-4 my-3 italic text-gray-700 dark:text-gray-300">
                        {children}
                      </blockquote>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className?.includes('language-');
                      return isInline ? (
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
                      ) : (
                        <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-x-auto">{children}</code>
                      );
                    },
                    img: ({ src, alt }) => (
                      <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full h-auto rounded-lg my-3"
                      />
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        className="text-primary hover:underline"
                        target={href?.startsWith('http') ? '_blank' : undefined}
                        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {value || '*No content yet. Start writing to see preview.*'}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}