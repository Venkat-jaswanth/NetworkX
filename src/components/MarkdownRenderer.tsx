import ReactMarkdown from 'react-markdown';
import '@/css/markdown.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div 
      className={`markdown-content ${className}`}
      style={{
        lineHeight: '1.6',
        wordBreak: 'break-word'
      }}
    >
      <ReactMarkdown
        components={{
          // Open links in new tab
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          // Style images
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt} 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                borderRadius: '8px', 
                margin: '8px 0' 
              }} 
              {...props}
            />
          ),
          // Style code blocks
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            return (
              <code 
                className={className}
                style={{
                  backgroundColor: isInline ? 'rgba(0,0,0,0.1)' : 'transparent',
                  padding: isInline ? '2px 4px' : '0',
                  borderRadius: isInline ? '4px' : '0',
                  fontSize: '0.9em',
                  fontFamily: 'monospace'
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Style code blocks
          pre: ({ children, ...props }) => (
            <pre 
              style={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                padding: '12px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '0.9em',
                fontFamily: 'monospace'
              }}
              {...props}
            >
              {children}
            </pre>
          ),
          // Style blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote 
              style={{
                borderLeft: '4px solid #ea580c',
                paddingLeft: '16px',
                margin: '16px 0',
                fontStyle: 'italic',
                color: '#666'
              }}
              {...props}
            >
              {children}
            </blockquote>
          ),
          // Style headings
          h1: ({ children, ...props }) => (
            <h1 style={{ color: '#ea580c', marginBottom: '16px', marginTop: '24px' }} {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 style={{ color: '#ea580c', marginBottom: '12px', marginTop: '20px' }} {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 style={{ color: '#ea580c', marginBottom: '8px', marginTop: '16px' }} {...props}>
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
