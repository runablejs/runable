---
title: Guide
description: Build, render, extend, and ship a Syora application.
---

This guide explains how to use Syora in a real application. Each page starts from a concrete need and shows the code to write.

## Build the interface

Start here to organize page navigation and display.

| Need | Page |
| --- | --- |
| Turn Vue files into routes | <a href="./routing.md">Routing</a> |
| Share a structure across pages | <a href="./layouts.md">Layouts</a> |
| Control navigation | <a href="./middlewares.md">Middleware</a> |
| Display and reset an error | <a href="./error-handling.md">Error handling</a> |

## Load and render

These pages cover data, SSR, and HTML metadata.

| Need | Page |
| --- | --- |
| Load data with caching and hydration | <a href="./data-fetching.md">Data Fetching</a> |
| Choose between SSR and CSR | <a href="./rendering-modes.md">SSR and CSR</a> |
| Define titles, SEO, and structured data | <a href="./head-and-seo.md">Head and SEO</a> |

## Extend Syora

Use auto-imports for application code, plugins to initialize Vue, and modules to distribute a complete set of conventions.

| Scope | Solution |
| --- | --- |
| A reusable function or component | <a href="./auto-imports.md">Auto-imports</a> |
| Initialization tied to the Vue application | <a href="./plugins.md">Plugins</a> |
| A configurable, distributable feature | <a href="./modules.md">Modules</a> |

## Configure and ship

Finish with <a href="./runtime-config.md">runtime configuration</a>, <a href="./css-and-assets.md">styles and assets</a>, then the <a href="./production-build.md">production build</a>.

::u-tip
---
variant: info
title: Guide or API reference?
---

Use the Guide to learn a complete workflow. Use the API section when you need the exact signature of a composable, component, or global.

::
