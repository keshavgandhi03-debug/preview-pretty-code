// Some source files were pre-compiled to development-style JSX calls.
// The production React runtime has no jsxDEV, so map those calls to the
// runtime that exists in every build.
import { jsx, jsxs, Fragment } from "react/jsx-runtime";

export { Fragment };

export function jsxDEV(type, props, key, isStaticChildren) {
  return (isStaticChildren ? jsxs : jsx)(type, props, key);
}
