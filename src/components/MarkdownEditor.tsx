import { useState, useRef } from 'react';
import { uploadImage, validateImageFile } from '@/services/storageService';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  allowImageUpload?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write something...",
  rows = 4,
  className = "",
  allowImageUpload = true
}: MarkdownEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'posts');
      
      // Insert markdown image syntax at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![${file.name}](${imageUrl})`;
        const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
        onChange(newValue);
        
        // Move cursor after inserted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    if (!allowImageUpload) return;
    
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
        break;
      }
    }
  };

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = selectedText || placeholder;
    
    let newText: string;
    let newCursorPos: number;

    if (syntax === 'link') {
      newText = `[${replacement || 'link text'}](url)`;
      newCursorPos = start + newText.length - 4; // Position cursor at 'url'
    } else if (syntax === 'image') {
      newText = `![${replacement || 'alt text'}](image-url)`;
      newCursorPos = start + newText.length - 11; // Position cursor at 'image-url'
    } else {
      newText = `${syntax}${replacement}${syntax}`;
      newCursorPos = selectedText ? start + newText.length : start + syntax.length;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + newText.length, start + newText.length);
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className={`markdown-editor ${className}`}>
      <div className="markdown-toolbar">
        <button
          type="button"
          onClick={() => insertMarkdown('**', 'bold text')}
          className="toolbar-button"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', 'italic text')}
          className="toolbar-button"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('`', 'code')}
          className="toolbar-button"
          title="Code"
        >
          {'<>'}
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('link')}
          className="toolbar-button"
          title="Link"
        >
          🔗
        </button>
        {allowImageUpload && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="toolbar-button"
              title="Upload Image"
              disabled={uploading}
            >
              {uploading ? '⏳' : '📷'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        rows={rows}
        className="markdown-textarea"
      />
      <div className="markdown-help">
        <small>
          Supports **bold**, *italic*, `code`, [links](url), and images. 
          {allowImageUpload && ' Paste or upload images directly.'}
        </small>
      </div>
    </div>
  );
}
