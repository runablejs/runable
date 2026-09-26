---
"runable": major
---

Add distDir as the canonical configuration option in @runable/core and deprecate distdir.

distdir remains supported for backward compatibility and will be removed in the next major version. When both options are defined, distDir takes precedence.