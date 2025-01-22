# TJEditor & TJRenderer Features

TJEditor is a sophisticated text editor and renderer pair with powerful capabilities.


## Core Components

### 1. TJEditor

- Rich text editing powered by Codemirror
- Configurable default content
- Real-time content updates with debouncing
- Clean, minimal interface
- Placeholder text support

### 2. TJRenderer

- Real-time markdown rendering
- Configurable debounce timing
- Support for all standard markdown syntax
- Advanced plugin system (remark/rehype)
- Custom component overrides

## Markdown Features

### 1. Basic Syntax

- Headers (H1-H6) with anchor links
- Bold/Italic text
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Inline code
- Blockquotes
- Horizontal rules

### 2. Extended Syntax

- Tables (via remark-gfm)
- Mathematical expressions (via remark-math)
- Raw HTML support (via rehype-raw)
- KaTeX support (via rehype-katex)
- Automatic heading slugs (via rehype-slug)

### 3. Custom Syntax

- Internal links: `[[Text]](url)`
- Quick asides: `?[content]`
- Callouts: `::type content`
- Spoilers: `||content||`
- Custom line breaks: `{\n}`
- External references:
  - Wikipedia: `[Text](wiki:Page_Title)`
  - DOI: `[Text](doi:10.1234/example)`

## Interactive Features

### 1. Links & Navigation

- Green-colored internal links
- Hover previews for links
- Nested link support
- Custom link click handlers
- Preview popup system for internal links
- External reference previews:
  - Wikipedia: Article extract, description, thumbnail, and metadata
  - DOI: Paper title, authors, journal info, abstract, and formatted citation

### 2. Code Blocks

- Syntax highlighting via Prism.js
- Line numbers
- Copy code button
- Custom copy handlers
- Multiple language support

### 3. Callouts

- Multiple types (info, warning, error, success, note)
- Customizable icons
- Distinct styling per type
- Nested markdown support within callouts

### 4. Quick Asides

- Tooltip-style popups
- Markdown support within tooltips
- Hover delay (300ms)
- Click-outside closing
- Scrollable content for long tooltips

### 5. Headings

- Auto-generated IDs
- Clickable anchor links
- Hover-reveal anchors
- Scroll margin for navigation
- Custom styling

## UI/UX Features

### 1. View Modes

- Full editor mode
- Full preview mode
- Split-screen mode
- Toggle buttons for view switching

### 2. Styling

- Clean, modern interface
- Responsive design
- Custom scrollbars
- Smooth animations
- Consistent typography

### 3. Preview Features

- Real-time preview updates
- Configurable preview delay
- Custom preview content loading
- Preview popups for links

## Customization Options

### 1. Configuration

- Custom callout icons
- Debounce timing
- Default content
- Preview handlers
- Copy handlers
- Link click handlers

### 2. Plugin System

- Custom remark plugins
- Custom rehype plugins
- Extensible component system
- Custom syntax processing

### 3. Styling

- Customizable CSS
- Theme variables
- Component-specific styles
- Responsive breakpoints

## Technical Features

### 1. Performance

- Debounced updates
- Memoized content processing
- Efficient DOM updates
- Lazy loading of components

### 2. Security

- Safe HTML rendering
- XSS protection
- Sanitized content

### 3. Developer Experience

- Modular component architecture
- Clear separation of concerns
- Extensive prop customization
- Event handling system

## Integration Features

### 1. React Integration

- Pure React components
- Prop-based configuration
- Event-based communication
- State management

### 2. Content Management

- Content state handling
- Default content support
- Content update callbacks
- Preview content handling

## Autocomplete Features

### 1. Internal Links

- Trigger: Type `[[` to start
- Fuzzy search through available pages
- Shows matching titles and URLs
- Navigate with arrow keys
- Press Enter to select
- Press Escape to cancel

### 2. Callout Types

- Trigger: Type `::` to start
- Available types: info, warning, error, success, note
- Shows type suggestions with descriptions
- Navigate with arrow keys
- Press Enter to select
- Press Escape to cancel

## Example usage:

```markdown
Type [[to see link suggestions:
[[Getting Started]]
[[Installation]]

Type :: to see callout types:
::info This is an info callout
::warning This is a warning
```

```markdown
# Interactive Elements Demo

## 1. Internal Links with Preview

[[Page Title]](/path/to/page)

[Normal Link](https://google.com)

- Hover to see preview after 500ms

- Click to open full preview modal

## 2. Callouts

::info This is an information callout

::warning This is a warning callout

::error This is an error callout

::success This is a success callout

::note This is a note callout

## 3. Spoilers

|| This is a hidden spoiler ||

|| You can also use **markdown** inside spoilers ||

## 4. Quick Asides

Normal text with ?[hover me for a quick tip] in the middle.

Another ?[these can contain longer explanations too!] example.

## 5. Combined Examples

::info Here's a callout with a [[linked page]](/demo) and a ?[tooltip] inside!

Normal paragraph with **bold**, _italic_, and `code`, plus a ?[hover for formatting tips] aside.

Here's a tooltip with a callout inside! ?[::info this is a demonstration{\n}Here is another line!]

## 6. Math Support

Inline math: $E=mc^2$

Block math:

$$\sum_{i=1}^n i = \frac{n(n+1)}{2}$$

## 7. Code Blocks

\```javascript

function demo() {
console.log("Syntax highlighted!");
}

\```

## 8. External References

### Wikipedia References
[Neural Networks](wiki:Neural_network)

### DOI References
[Research Paper](doi:10.1234/example)

Each element has special features:

1. Internal Links (`[[text]](url)`):

   - Hover preview with title and excerpt

   - Full-screen preview modal on click

   - Smooth animations

   - Arrow pointer in preview

2. Callouts (`::type message`):

   - Five types: info, warning, error, success, note

   - Emoji icons

   - Colored backgrounds

   - Supports markdown inside

3. Spoilers (`|| content ||`):

   - Click to reveal/hide

   - Supports markdown inside

   - Smooth transitions

   - "Click to reveal/hide" indicator

4. Quick Asides (`?[tooltip text]`):

   - Hover to show tooltip

   - Clean circular indicator

   - Supports longer explanations

   - Smooth fade animations

5. Math Support:

   - Inline with single `$`

   - Block with triple `$$$`

   - KaTeX rendering

6. Code Blocks:

   - Syntax highlighting

   - Support for many languages

   - Dark theme

   - Monospace font

   - Line numbers on the left

   - Copy button in the top right

   - Language indicator in the top left

7. Newline characters:

   - `{\n}` can be written as `{\\n}` with only one backslash

8. External References:
   1. Wikipedia References `[title](wiki:page_title)`
      - Article title and description
      - Main extract with HTML formatting
      - Thumbnail image (if available)
      - Last modified date
      - Link to full article

   2. DOI References `[title](doi:doi/number)`
      - Paper title
      - Authors list
      - Journal information (name, volume, issue)
      - Publication year
      - Abstract
      - Formatted citation
      - Link to full paper

```
All elements can be nested and combined (except code blocks), and they all support markdown formatting inside them.