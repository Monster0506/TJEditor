import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import Prism from "prismjs";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-css";
import "prismjs/components/prism-go";
import "prismjs/components/prism-graphql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";
import "./styles.css";

const DEFAULT_CALLOUT_ICONS = {
  info: "💡",
  warning: "⚠️",
  error: "❌",
  success: "✅",
  note: "📝",
};

const DEFAULT_DEBOUNCE_MS = 100;

const useDebounce = (value, delay = DEFAULT_DEBOUNCE_MS) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PreviewPopup = ({ url, title, onClose, previewContent }) => {
  const popupRef = useRef(null);
  const [content, setContent] = useState("");
  const [previewType, setPreviewType] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const loadPreview = async () => {
      if (url.startsWith("wiki:")) {
        setPreviewType("wiki");
        setPreviewData(url.substring(5));
      } else if (url.startsWith("doi:")) {
        setPreviewType("doi");
        setPreviewData(url.substring(4));
      } else if (previewContent) {
        const preview = await previewContent(url);
        setContent(preview);
      }
    };
    loadPreview();
  }, [url, previewContent]);

  const processedContent = useMemo(() => {
    return processCustomSyntax(content);
  }, [content]);

  return (
    <div className="preview-popup-overlay">
      <div ref={popupRef} className="preview-popup">
        <div className="preview-header">
          <span>
            <h3>
              <a href={previewType === "wiki" ? `https://en.wikipedia.org/wiki/${previewData}` :
                previewType === "doi" ? `https://doi.org/${previewData}` :
                  url}>
                {title}
              </a>
            </h3>
            <span className="preview-url">{url}</span>
          </span>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="preview-content">
          {previewType === "wiki" ? (
            <WikiPreview title={previewData} />
          ) : previewType === "doi" ? (
            <DOIPreview doi={previewData} />
          ) : content ? (
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSlug]}
              components={{
                greenlink: ({ node, href, children }) => (
                  <Greenlink
                    href={href}
                    isNested={true}
                    onClick={(url) => window.open(url, "_blank")}
                  >
                    {children}
                  </Greenlink>
                ),
                "quick-aside": ({ node, content }) => (
                  <QuickAside content={content} />
                ),
                spoiler: ({ node, children }) => <Spoiler>{children}</Spoiler>,
                callout: ({ node, type, children }) => (
                  <Callout type={type}>{children}</Callout>
                ),
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match ? match[1] : "";

                  const codeContent = children
                    ? Array.isArray(children)
                      ? children.join("")
                      : children.toString()
                    : "";

                  if (!className && (inline || !codeContent.includes("\n"))) {
                    return (
                      <code className="inline-code" {...props}>
                        {codeContent}
                      </code>
                    );
                  }

                  return <CodeBlock code={codeContent} language={lang} />;
                },
              }}
            >
              {processedContent}
            </ReactMarkdown>
          ) : (
            "Loading..."
          )}
        </div>
      </div>
    </div>
  );
};

const Greenlink = ({ href, children, onClick, isNested = false }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);
  const linkRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(href);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (linkRef.current && !linkRef.current.contains(event.target)) {
        setIsHovered(false);
      }
    };

    if (isHovered) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHovered]);

  return (
    <span ref={linkRef} style={{ position: "relative" }}>
      <a
        className={`greenlink ${isNested ? "nested" : ""}`}
        href={href}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </a>
      {isHovered && !isNested && (
        <div className="hover-preview">
          <div className="hover-preview-content">
            <strong>{children}</strong>
            <span className="preview-url">{href}</span>
          </div>
        </div>
      )}
    </span>
  );
};

const Callout = ({
  type = "info",
  children,
  icons = DEFAULT_CALLOUT_ICONS,
}) => {
  const icon = icons[type] || DEFAULT_CALLOUT_ICONS[type];
  return (
    <div className={`callout callout-${type}`}>
      <div className="callout-icon">{icon}</div>
      <div className="callout-content">{children}</div>
    </div>
  );
};

const Spoiler = ({ children }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const spoilerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (spoilerRef.current && !spoilerRef.current.contains(event.target)) {
        setIsRevealed(false);
      }
    };

    if (isRevealed) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRevealed]);

  const handleClick = (e) => {
    e.preventDefault();
    setIsRevealed(!isRevealed);
  };

  return (
    <span
      ref={spoilerRef}
      className={`spoiler ${isRevealed ? "revealed" : ""} ${isHovered ? "hovered" : ""}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={
        isRevealed ? "Click to hide spoiler" : "Click to reveal spoiler"
      }
    >
      <span className="spoiler-content">{children}</span>
      <span className="spoiler-overlay">{isRevealed ? "Hide" : "Reveal"}</span>
    </span>
  );
};

const QuickAside = ({ content }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsHovered(false);
      }
    };

    if (isHovered) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHovered]);

  const processedContent = useMemo(() => {
    return processCustomSyntax(content);
  }, [content]);

  return (
    <span
      className="quick-aside"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      ?
      {isHovered && (
        <div className="quick-aside-tooltip" ref={tooltipRef}>
          <div className="quick-aside-content">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSlug]}
              components={{
                greenlink: ({ node, href, children }) => (
                  <Greenlink href={href}>{children}</Greenlink>
                ),
                "quick-aside": ({ node, content }) => (
                  <QuickAside content={content} />
                ),
                spoiler: ({ node, children }) => <Spoiler>{children}</Spoiler>,
                callout: ({ node, type, children }) => (
                  <Callout type={type}>{children}</Callout>
                ),
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match ? match[1] : "";

                  const codeContent = children
                    ? Array.isArray(children)
                      ? children.join("")
                      : children.toString()
                    : "";

                  if (!className && (inline || !codeContent.includes("\n"))) {
                    return (
                      <code className="inline-code" {...props}>
                        {codeContent}
                      </code>
                    );
                  }

                  return <CodeBlock code={codeContent} language={lang} />;
                },
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </span>
  );
};

const CodeBlock = ({ code, language, onCopy }) => {
  const [copied, setCopied] = useState(false);
  let lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      lines.splice(i, 1);
      i--;
    }
  }

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy(code);
    } else {
      await navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        {language && <span className="code-language">{language}</span>}
        <button
          className={`copy-button ${copied ? "copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <div className="code-block-content">
        <div className="line-numbers">
          {lines.map((_, i) => (
            <span key={i} className="line-number">
              {i + 1}
            </span>
          ))}
        </div>
        <pre className={`language-${language}`}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const DOIPreview = ({ doi }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDOIContent = async () => {
      try {
        const response = await fetch(
          `http://doi-extract.vercel.app/api/doi/${encodeURIComponent(doi)}`
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        setError("Failed to load DOI preview");
      } finally {
        setLoading(false);
      }
    };
    fetchDOIContent();
  }, [doi]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div>No data available</div>;

  const citationString = `${data.authors.join(", ")} (${data.year}). ${data.title}. ${data.fullJournal
    }${data.volume ? `, ${data.volume}` : ""}${data.issue ? `(${data.issue})` : ""}${data.firstPage && data.lastPage ? `, ${data.firstPage}-${data.lastPage}` : ""
    }. DOI: ${data.doi}`;

  return (
    <div className="doi-preview">
      <div className="doi-header">
        <div className="doi-title">{data.title}</div>
        <div className="doi-meta">
          <span>{data.fullJournal}</span>
          {data.volume && <span>Volume {data.volume}</span>}
          {data.issue && <span>Issue {data.issue}</span>}
          <span>{data.year}</span>
        </div>
        <div className="doi-authors">
          {data.authors.map((author, index) => (
            <span key={index}>
              {author}
              {index < data.authors.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      </div>
      {data.abstract && (
        <div className="doi-abstract">
          <strong>Abstract:</strong>
          <p>{data.abstract}</p>
        </div>
      )}
      <div className="doi-citation">
        <strong>Citation:</strong>
        <p>{citationString}</p>
      </div>

      <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" className="doi-full-article">
        Read full article
      </a>
    </div>
  );
};

const WikiPreview = ({ title }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWikiContent = async () => {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
        );
        const summaryData = await response.json();

        // Fetch additional page data
        const pageResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/title/${encodeURIComponent(title)}`
        );
        const pageData = await pageResponse.json();
        const metadata = pageData["items"][0]

        setData({
          ...summaryData,
          metadata: metadata
        });
      } catch (error) {
        setError("Failed to load Wikipedia preview");
      } finally {
        setLoading(false);
      }
    };
    fetchWikiContent();
  }, [title]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div>No content available</div>;
  console.log(data);

  return (
    <div className="wiki-preview">
      <div className="wiki-content">
        <div className="wiki-title">
          <h2>{data.title}</h2>
          {data.description && <p className="wiki-description">{data.description}</p>}
        </div>
        <div className="wiki-extract">
          {data.extract_html ? (
            <div dangerouslySetInnerHTML={{ __html: data.extract_html }} />
          ) : (
            <p>{data.extract_html}</p>
          )}
        </div>
        <div className="wiki-meta">
          {data.metadata && (
            <>
              <div className="wiki-stats">
                <span>Last modified: {new Date(data.metadata.timestamp).toLocaleDateString()}</span>
              </div>
            </>
          )}
          <div className="wiki-links">
            <a
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wiki-full-article"
            >
              Read Wikipedia article
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const processCustomSyntax = (content) => {
  if (!content) return "";

  // Clean up any remaining HTML artifacts
  let processed = content
    .replace(/<div>/g, "")
    .replace(/<\/div>/g, "")
    .replace(/\n\n+/g, "\n\n")
    .trim();

  // Process quick asides
  processed = processed.replace(/\?\[(.*?)\]/g, (_, content) => {
    return `<quick-aside content="${content}">?</quick-aside>`;
  });

  // Inline spoilers
  processed = processed.replace(/\|\|(.*?)\|\|/g, (_, content) => {
    return `<spoiler>${content}</spoiler>`;
  });

  // Process callouts
  processed = processed.replace(
    /^::(info|warning|error|success|note)\s+(.*?)$/gm,
    (_, type, content) => {
      return `<callout type="${type}">${content}</callout>`;
    },
  );

  // Process wiki links
  processed = processed.replace(/\[(.*?)\]\(wiki:(.*?)\)/g, (_, text, page) => {
    return `<greenlink href="wiki:${page}">${text}</greenlink>`;
  });

  // Process DOI links
  processed = processed.replace(/\[(.*?)\]\(doi:(.*?)\)/g, (_, text, doi) => {
    return `<greenlink href="doi:${doi}">${text}</greenlink>`;
  });

  // Process internal links
  processed = processed.replace(/\[\[(.*?)\]\]\((.*?)\)/g, (_, text, url) => {
    return `<greenlink href="${url}">${text}</greenlink>`;
  });

  // process newline characters "{\n}"
  processed = processed.replace(/{\\n}/g, "<br>");

  return processed;
};

/**
 * TJRenderer component for rendering markdown content
 * @param {Object} props
 * @param {string} props.content - Markdown content to render
 * @param {number} [props.debounceMs=100] - Debounce delay in milliseconds
 * @param {Object} [props.calloutIcons] - Custom icons for callouts
 * @param {Function} [props.previewContent] - Function to get preview content for internal links
 * @param {Function} [props.onCopy] - Custom function for handling code copy
 * @param {Function} [props.onLinkClick] - Custom function for handling internal link clicks
 * @param {Object} [props.remarkPlugins] - Additional remark plugins
 * @param {Object} [props.rehypePlugins] - Additional rehype plugins
 */
export const TJRenderer = ({
  content,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  calloutIcons = DEFAULT_CALLOUT_ICONS,
  previewContent,
  onCopy,
  onLinkClick,
  remarkPlugins: additionalRemarkPlugins = [],
  rehypePlugins: additionalRehypePlugins = [],
}) => {
  const [renderKey, setRenderKey] = useState(0);
  const debouncedContent = useDebounce(content, debounceMs);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      Prism.hooks.add("before-highlight", (env) => {
        // env.code = env.code.replace(/\n\n/g, '\n');
      });

      Prism.highlightAll();
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [debouncedContent, debounceMs]);

  const processedContent = useMemo(() => {
    return processCustomSyntax(debouncedContent || "");
  }, [debouncedContent]);

  const handleLinkClick = async (url, greenlink = false) => {
    if (onLinkClick && !greenlink) {
      await onLinkClick(url);
    }
    setPreviewUrl(url);
  };

  return (
    <div className="renderer-container">
      <ReactMarkdown
        key={renderKey}
        remarkPlugins={[remarkMath, remarkGfm, ...additionalRemarkPlugins]}
        rehypePlugins={[
          rehypeKatex,
          rehypeRaw,
          rehypeSlug,
          ...additionalRehypePlugins,
        ]}
        components={{
          greenlink: ({ node, href, children }) => (
            <Greenlink href={href} onClick={() => handleLinkClick(href, true)}>
              {children}
            </Greenlink>
          ),
          "quick-aside": ({ node, content }) => (
            <QuickAside content={content} />
          ),
          spoiler: ({ node, children }) => <Spoiler>{children}</Spoiler>,
          callout: ({ node, type, children }) => (
            <Callout type={type} icons={calloutIcons}>
              {children}
            </Callout>
          ),
          h1: ({ node, children, ...props }) => (
            <h1 {...props} className="heading">
              {children}
              <a href={`#${props.id}`} className="heading-anchor" aria-hidden>
                #
              </a>
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 {...props} className="heading">
              {children}
              <a href={`#${props.id}`} className="heading-anchor" aria-hidden>
                #
              </a>
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 {...props} className="heading">
              {children}
              <a href={`#${props.id}`} className="heading-anchor" aria-hidden>
                #
              </a>
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 {...props} className="heading">
              {children}
              <a href={`#${props.id}`} className="heading-anchor" aria-hidden>
                #
              </a>
            </h4>
          ),
          h5: ({ node, children, ...props }) => (
            <h5 {...props} className="heading">
              {children}
              <a href={`#${props.id}`} className="heading-anchor" aria-hidden>
                #
              </a>
            </h5>
          ),
          h6: ({ node, children, ...props }) => (
            <h6 {...props} className="heading">
              {children}
              <a href={`#${props.id}`} className="heading-anchor" aria-hidden>
                #
              </a>
            </h6>
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";

            const codeContent = children
              ? Array.isArray(children)
                ? children.join("")
                : children.toString()
              : "";

            if (!className && (inline || !codeContent.includes("\n"))) {
              return (
                <code className="inline-code" {...props}>
                  {codeContent}
                </code>
              );
            }

            return (
              <CodeBlock code={codeContent} language={lang} onCopy={onCopy} />
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
      {previewUrl && (
        <PreviewPopup
          url={previewUrl}
          title="Preview"
          onClose={() => setPreviewUrl(null)}
          previewContent={previewContent}
        />
      )}
    </div>
  );
};
