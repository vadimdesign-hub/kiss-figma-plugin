# Graph Report - .  (2026-06-03)

## Corpus Check
- Corpus is ~28,335 words - fits in a single context window. You may not need a graph.

## Summary
- 68 nodes · 110 edges · 15 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Section Alignment Core|Section Alignment Core]]
- [[_COMMUNITY_Toolbar UI & UX|Toolbar UI & UX]]
- [[_COMMUNITY_Expand & Custom Commands|Expand & Custom Commands]]
- [[_COMMUNITY_Art  Tags  Wrap Features|Art / Tags / Wrap Features]]
- [[_COMMUNITY_FAQ Documentation|FAQ Documentation]]
- [[_COMMUNITY_Settings & Theming|Settings & Theming]]
- [[_COMMUNITY_Math Utilities|Math Utilities]]
- [[_COMMUNITY_Clipboard & Messaging|Clipboard & Messaging]]
- [[_COMMUNITY_Replace Instance|Replace Instance]]
- [[_COMMUNITY_Find Similar|Find Similar]]
- [[_COMMUNITY_Autosection Command|Autosection Command]]
- [[_COMMUNITY_Ready for Dev|Ready for Dev]]
- [[_COMMUNITY_Align Sections Feature|Align Sections Feature]]
- [[_COMMUNITY_Asset Slicing|Asset Slicing]]
- [[_COMMUNITY_Light Theme|Light Theme]]

## God Nodes (most connected - your core abstractions)
1. `tryClose()` - 20 edges
2. `Tools Data Array (toolbar buttons)` - 14 edges
3. `Kiss Figma Plugin (README overview)` - 13 edges
4. `Toolbar UI Component` - 10 edges
5. `FAQ Panel (Header + Sidebar + Content)` - 8 edges
6. `Settings Panel` - 6 edges
7. `Plugin Message Handler (window.onmessage)` - 5 edges
8. `artTextResize()` - 3 edges
9. `Dark Theme CSS Variables` - 3 edges
10. `Dynamic (Compact) Toolbar Mode` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Screenshot: Toolbar Expanded/Collapsed States` --conceptually_related_to--> `Toolbar UI Component`  [EXTRACTED]
  Frame 10698003.png → ui.html
- `Feature: Settings (icon style + theme)` --conceptually_related_to--> `Settings Panel`  [INFERRED]
  README.md → ui.html
- `Screenshot: FAQ Panel with Sidebar Navigation` --conceptually_related_to--> `FAQ Panel (Header + Sidebar + Content)`  [EXTRACTED]
  Frame 10698005.png → ui.html
- `Screenshot: FAQ Panel with Sidebar Navigation` --conceptually_related_to--> `Menu Data Array (FAQ entries)`  [EXTRACTED]
  Frame 10698005.png → ui.html
- `Screenshot: Toolbar Expanded/Collapsed States` --conceptually_related_to--> `Dynamic (Compact) Toolbar Mode`  [EXTRACTED]
  Frame 10698003.png → ui.html

## Hyperedges (group relationships)
- **Toolbar Commands System** — ui_toolbar, ui_tools_data, ui_cmd_align_sections, ui_cmd_expand_right, ui_cmd_expand_left, ui_cmd_autosection, ui_cmd_wrap, ui_cmd_ready_for_dev, ui_cmd_replace, ui_cmd_slice, ui_cmd_art, ui_cmd_find_similar, ui_cmd_translate, ui_cmd_custom, ui_cmd_tag_grid [EXTRACTED 1.00]
- **Settings & Theming System** — ui_settings_panel, ui_icon_style_setting, ui_theme_setting, ui_window_mode_setting, ui_dark_theme, ui_light_theme, ui_dynamic_mode [EXTRACTED 0.95]
- **FAQ Documentation System** — ui_faq_panel, ui_menu_data, frame_10698005_faq_screenshot, readme_feature_faq [INFERRED 0.90]
- **Toolbar UX Features (drag-drop, compact mode)** — ui_toolbar, ui_drag_drop, ui_dynamic_mode, frame_10698003_toolbar_screenshot [EXTRACTED 0.95]

## Communities

### Community 0 - "Section Alignment Core"
Cohesion: 0.18
Nodes (19): alignAllSections(), autoSectionAlign(), copyLinkToSelection(), createDoneTag(), createMediumTag(), createReviewTag(), createServerIcons(), createUrgentTag() (+11 more)

### Community 1 - "Toolbar UI & UX"
Cohesion: 0.32
Nodes (8): Screenshot: Toolbar Expanded/Collapsed States, Feature: Floating Toolbar, Drag-and-Drop Toolbar Reordering, Dynamic (Compact) Toolbar Mode, IC SVG Icon Set, Icon Style Setting (SVG vs Emoji), Toolbar UI Component, Window Mode Setting (normal vs dynamic)

### Community 2 - "Expand & Custom Commands"
Cohesion: 0.29
Nodes (8): Feature: Expand/Duplicate Left-Right, Command: custom (name sync), Command: expandSectionLeft (left), Command: expandSection (right), Command Grid: priority tags (orange/red/green/blue), Command: translate, Tools Data Array (toolbar buttons), Translation via Google Translate API

### Community 3 - "Art / Tags / Wrap Features"
Cohesion: 0.33
Nodes (6): Feature: Art Dimensions, Feature: Priority Status Tags (4 colors), Feature: Wrap + Align, Kiss Figma Plugin (README overview), Command: art (art dimensions), Command: wrap

### Community 4 - "FAQ Documentation"
Cohesion: 0.83
Nodes (4): Screenshot: FAQ Panel with Sidebar Navigation, Feature: Built-in FAQ, FAQ Panel (Header + Sidebar + Content), Menu Data Array (FAQ entries)

### Community 5 - "Settings & Theming"
Cohesion: 0.5
Nodes (4): Feature: Settings (icon style + theme), Dark Theme CSS Variables, Settings Panel, Theme Setting (light vs dark)

### Community 6 - "Math Utilities"
Cohesion: 1.0
Nodes (2): artTextResize(), roundToEvenDown()

### Community 7 - "Clipboard & Messaging"
Cohesion: 1.0
Nodes (2): Copy Figma Node Link to Clipboard, Plugin Message Handler (window.onmessage)

### Community 8 - "Replace Instance"
Cohesion: 1.0
Nodes (2): Feature: Replace Instance, Command: replace (instance swap)

### Community 9 - "Find Similar"
Cohesion: 1.0
Nodes (2): Feature: Find Similar, Command: findSimilar

### Community 10 - "Autosection Command"
Cohesion: 1.0
Nodes (2): Feature: Align + Dark Theme, Command: autosection (align + dark)

### Community 11 - "Ready for Dev"
Cohesion: 1.0
Nodes (2): Feature: Ready for Dev, Command: readyForDev

### Community 12 - "Align Sections Feature"
Cohesion: 1.0
Nodes (2): Feature: Align All Sections, Command: alignAllSections

### Community 13 - "Asset Slicing"
Cohesion: 1.0
Nodes (2): Feature: Asset Cutting (Slice), Command: slice (asset cutting)

### Community 14 - "Light Theme"
Cohesion: 1.0
Nodes (1): Light Theme CSS Variables

## Knowledge Gaps
- **6 isolated node(s):** `Light Theme CSS Variables`, `Drag-and-Drop Toolbar Reordering`, `Copy Figma Node Link to Clipboard`, `Command: custom (name sync)`, `Command Grid: priority tags (orange/red/green/blue)` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Math Utilities`** (2 nodes): `artTextResize()`, `roundToEvenDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Clipboard & Messaging`** (2 nodes): `Copy Figma Node Link to Clipboard`, `Plugin Message Handler (window.onmessage)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Replace Instance`** (2 nodes): `Feature: Replace Instance`, `Command: replace (instance swap)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Find Similar`** (2 nodes): `Feature: Find Similar`, `Command: findSimilar`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Autosection Command`** (2 nodes): `Feature: Align + Dark Theme`, `Command: autosection (align + dark)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Ready for Dev`** (2 nodes): `Feature: Ready for Dev`, `Command: readyForDev`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Align Sections Feature`** (2 nodes): `Feature: Align All Sections`, `Command: alignAllSections`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Asset Slicing`** (2 nodes): `Feature: Asset Cutting (Slice)`, `Command: slice (asset cutting)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Light Theme`** (1 nodes): `Light Theme CSS Variables`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tools Data Array (toolbar buttons)` connect `Expand & Custom Commands` to `Toolbar UI & UX`, `Art / Tags / Wrap Features`, `Replace Instance`, `Find Similar`, `Autosection Command`, `Ready for Dev`, `Align Sections Feature`, `Asset Slicing`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **Why does `Kiss Figma Plugin (README overview)` connect `Art / Tags / Wrap Features` to `Toolbar UI & UX`, `Expand & Custom Commands`, `FAQ Documentation`, `Settings & Theming`, `Replace Instance`, `Find Similar`, `Autosection Command`, `Ready for Dev`, `Align Sections Feature`, `Asset Slicing`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `Toolbar UI Component` connect `Toolbar UI & UX` to `Expand & Custom Commands`, `Settings & Theming`, `Clipboard & Messaging`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `Light Theme CSS Variables`, `Drag-and-Drop Toolbar Reordering`, `Copy Figma Node Link to Clipboard` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._