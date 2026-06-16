# Graph Report - /Users/vadim/Desktop/Kiss  (2026-06-16)

## Corpus Check
- 1 files · ~33,405 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 41 nodes · 61 edges · 5 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `tryClose()` - 22 edges
2. `Kiss Figma Plugin (README overview)` - 13 edges
3. `artTextResize()` - 3 edges
4. `replaceWithInstance()` - 2 edges
5. `autoSectionAlign()` - 2 edges
6. `wrapObjectsInSection()` - 2 edges
7. `scaleSelection267()` - 2 edges
8. `createServerIcons()` - 2 edges
9. `roundToEvenDown()` - 2 edges
10. `wrapOrAlignSectionClean()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Feature: Floating Toolbar` --conceptually_related_to--> `Screenshot: Toolbar Expanded/Collapsed States`  [EXTRACTED]
  README.md → Frame 10698003.png
- `Feature: Built-in FAQ` --conceptually_related_to--> `Screenshot: FAQ Panel with Sidebar Navigation`  [EXTRACTED]
  README.md → Frame 10698005.png

## Hyperedges (group relationships)
- **Toolbar Commands System** — ui_toolbar, ui_tools_data, ui_cmd_align_sections, ui_cmd_expand_right, ui_cmd_expand_left, ui_cmd_autosection, ui_cmd_wrap, ui_cmd_ready_for_dev, ui_cmd_replace, ui_cmd_slice, ui_cmd_art, ui_cmd_find_similar, ui_cmd_translate, ui_cmd_custom, ui_cmd_tag_grid [EXTRACTED 1.00]
- **Settings & Theming System** — ui_settings_panel, ui_icon_style_setting, ui_theme_setting, ui_window_mode_setting, ui_dark_theme, ui_light_theme, ui_dynamic_mode [EXTRACTED 0.95]
- **FAQ Documentation System** — ui_faq_panel, ui_menu_data, frame_10698005_faq_screenshot, readme_feature_faq [INFERRED 0.90]
- **Toolbar UX Features (drag-drop, compact mode)** — ui_toolbar, ui_drag_drop, ui_dynamic_mode, frame_10698003_toolbar_screenshot [EXTRACTED 0.95]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (21): alignAllSections(), autoSectionAlign(), copyLinkToSelection(), createDoneTag(), createMediumTag(), createReviewTag(), createServerIcons(), createUrgentTag() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (12): Feature: Align All Sections, Feature: Art Dimensions, Feature: Align + Dark Theme, Feature: Expand/Duplicate Left-Right, Feature: Find Similar, Feature: Priority Status Tags (4 colors), Feature: Ready for Dev, Feature: Replace Instance (+4 more)

### Community 2 - "Community 2"
Cohesion: 1.0
Nodes (2): artTextResize(), roundToEvenDown()

### Community 3 - "Community 3"
Cohesion: 1.0
Nodes (2): Screenshot: Toolbar Expanded/Collapsed States, Feature: Floating Toolbar

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (2): Screenshot: FAQ Panel with Sidebar Navigation, Feature: Built-in FAQ

## Knowledge Gaps
- **13 isolated node(s):** `Feature: Align All Sections`, `Feature: Expand/Duplicate Left-Right`, `Feature: Align + Dark Theme`, `Feature: Wrap + Align`, `Feature: Replace Instance` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 2`** (2 nodes): `artTextResize()`, `roundToEvenDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (2 nodes): `Screenshot: Toolbar Expanded/Collapsed States`, `Feature: Floating Toolbar`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (2 nodes): `Screenshot: FAQ Panel with Sidebar Navigation`, `Feature: Built-in FAQ`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `tryClose()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Why does `Kiss Figma Plugin (README overview)` connect `Community 1` to `Community 3`, `Community 4`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `Feature: Floating Toolbar` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `Feature: Align All Sections`, `Feature: Expand/Duplicate Left-Right`, `Feature: Align + Dark Theme` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._