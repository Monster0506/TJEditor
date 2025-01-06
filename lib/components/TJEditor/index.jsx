import React, { useEffect, useCallback } from "react";
import { EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { autocompletion } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "thememirror";
import { ayuLight } from "thememirror";
import { solarizedLight } from "thememirror";
import "./styles.css";

// Fuzzy search implementation
const fuzzyMatch = (text, pattern) => {
  const textLower = text.toLowerCase().split("").sort().join("");
  const patternLower = pattern.toLowerCase().split("").sort().join("");
  let score = 1;
  let lastIndex = -1;
  for (let i = 0; i < patternLower.length; i++) {
    const index = textLower.indexOf(patternLower[i], lastIndex + 1);
    if (index === -1) return 0;
    score += 1 / (index - lastIndex);
    lastIndex = index;
  }
  return score;
};

const CALLOUT_TYPES = ["info", "warning", "error", "success", "note"];

const themes = {
  light: [],
  dark: [dracula],
  monochrome: [ayuLight],
  solarized: [solarizedLight],
  ocean: EditorView.theme({
    "&": {
      backgroundColor: "#f8fafc",
      height: "100%",
    },
    ".cm-content": {
      color: "#1e293b",
    },
    ".cm-cursor": {
      borderLeftColor: "#0ea5e9",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#0ea5e9",
    },
    ".cm-activeLine": {
      backgroundColor: "#e0f2fe50",
    },
    ".cm-selectionBackground": {
      backgroundColor: "#bae6fd50",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "#bae6fd50",
    },
    ".cm-selectionMatch": {
      backgroundColor: "#bae6fd50",
    },
  }),
};

export const TJEditor = ({
  onChange,
  content = "",
  theme = "dark",
  getLinkSuggestions,
}) => {
  const editorRef = React.useRef();
  const viewRef = React.useRef();

  const createCompletion = useCallback(
    async (context) => {
      const word =
        context.matchBefore(/\[\[.*$/) || context.matchBefore(/::\w*$/);

      if (!word) return null;

      if (word.text.startsWith("[[")) {
        const query = word.text.slice(2);
        const links = (await getLinkSuggestions?.(query)) || [];

        const fuzzyResults = links
          .map((link) => {
            const titleScore = fuzzyMatch(link.title, query);
            const urlScore = fuzzyMatch(link.url, query);
            return {
              link,
              score: Math.max(titleScore, urlScore),
            };
          })
          .filter((result) => result.score > 0)
          .sort((a, b) => b.score - a.score);

        return {
          from: word.from + 2,
          options: fuzzyResults.map(({ link }) => ({
            label: link.title,
            type: "link",
            detail: `${link.url}`,
            apply: `${link.title}]](${link.url})`,
          })),
        };
      }

      if (word.text.startsWith("::")) {
        const query = word.text.slice(2);
        const fuzzyResults = CALLOUT_TYPES.map((type) => ({
          type,
          score: fuzzyMatch(type, query),
        }))
          .filter((result) => result.score > 0)
          .sort((a, b) => b.score - a.score);

        return {
          from: word.from + 2,
          options: fuzzyResults.map(({ type }) => ({
            label: type,
            type: "callout",
            detail: `Insert ${type} callout`,
            apply: `${type} `,
          })),
        };
      }

      return null;
    },
    [getLinkSuggestions],
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        javascript(),
        EditorState.tabSize.of(2),
        EditorView.lineWrapping,
        autocompletion({
          override: [createCompletion],
          defaultKeymap: true,
          maxRenderedOptions: 50,
          activateOnTyping: true,
          icons: true,
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange?.(update.state.doc.toString());
          }
        }),
        themes[theme] || [],
        EditorView.theme({
          "&": {
            height: "100%",
            minHeight: "0",
            flex: "1",
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          ".cm-editor": {
            height: "100%",
            flex: "1",
          },
          ".cm-scroller": {
            overflow: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#94a3b8 transparent",
            height: "100%",
          },
          ".cm-content": {
            fontFamily: "inherit",
            fontSize: "inherit",
          },
          "&.cm-focused": {
            outline: "none",
          },
          ".cm-gutters": {
            display: "none",
          },
          // Enhanced autocompletion styling
          ".cm-tooltip.cm-tooltip-autocomplete": {
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            padding: "0.5rem 0",
            maxHeight: "300px",
            overflow: "auto",
          },
          ".cm-tooltip.cm-tooltip-autocomplete > ul": {
            fontFamily: "inherit",
            maxHeight: "none",
          },
          ".cm-tooltip-autocomplete ul li": {
            padding: "0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            lineHeight: "1.25rem",
            cursor: "pointer",
          },
          ".cm-tooltip-autocomplete ul li[aria-selected]": {
            backgroundColor: "#f8fafc",
          },
          ".cm-completionLabel": {
            fontWeight: "500",
            color: "#1e293b",
          },
          ".cm-completionDetail": {
            color: "#64748b",
            fontSize: "0.875rem",
            marginLeft: "0.5rem",
          },
          ".cm-tooltip.cm-completionInfo": {
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            padding: "1rem",
            marginLeft: "0.5rem",
          },
          ".completion-info": {
            fontFamily: "inherit",
          },
          ".completion-preview": {
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          },
          ".preview-label": {
            color: "#64748b",
            fontSize: "0.875rem",
          },
          ".completion-preview code": {
            backgroundColor: "#f8fafc",
            padding: "0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.875rem",
            fontFamily: "monospace",
          },
          // Custom scrollbar styles
          ".cm-scroller::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          ".cm-scroller::-webkit-scrollbar-track": {
            background: "transparent",
          },
          ".cm-scroller::-webkit-scrollbar-thumb": {
            backgroundColor: "#94a3b8",
            borderRadius: "4px",
          },
          ".cm-scroller::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#64748b",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Update content from props
  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return (
    <div className={`editor-wrapper theme-${theme}`}>
      <div ref={editorRef} className={`editor-container theme-${theme}`} />
    </div>
  );
};
