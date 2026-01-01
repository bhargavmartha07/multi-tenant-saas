import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/NavBar.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=7a2f9524"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=7a2f9524"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"];
import { Link } from "/node_modules/.vite/deps/react-router-dom.js?v=34be70a3";
import useAuth from "/src/auth/useAuth.js";
import "/src/components/NavBar.css";
export default function NavBar() {
  _s();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const role = user?.role;
  const homeHref = role === "super_admin" ? "/super-admin" : role === "tenant_admin" ? "/tenant-admin" : "/user";
  return /* @__PURE__ */ jsxDEV("header", { className: "app-nav", children: /* @__PURE__ */ jsxDEV("div", { className: "nav-inner", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "brand", children: [
      /* @__PURE__ */ jsxDEV(Link, { to: homeHref, className: "brand-link", children: "Multi Tenant SaaS" }, void 0, false, {
        fileName: "/app/src/components/NavBar.jsx",
        lineNumber: 18,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "hamburger", onClick: () => setOpen(!open), "aria-label": "Toggle menu", children: "☰" }, void 0, false, {
        fileName: "/app/src/components/NavBar.jsx",
        lineNumber: 19,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/src/components/NavBar.jsx",
      lineNumber: 17,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("nav", { className: `nav-links ${open ? "open" : ""}`, "aria-expanded": open, children: [
      /* @__PURE__ */ jsxDEV(Link, { to: homeHref, onClick: () => setOpen(false), children: "Dashboard" }, void 0, false, {
        fileName: "/app/src/components/NavBar.jsx",
        lineNumber: 23,
        columnNumber: 11
      }, this),
      role === "tenant_admin" && /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV(Link, { to: "/tenant-admin/projects", onClick: () => setOpen(false), children: "Projects" }, void 0, false, {
          fileName: "/app/src/components/NavBar.jsx",
          lineNumber: 26,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/tenant-admin/users", onClick: () => setOpen(false), children: "Users" }, void 0, false, {
          fileName: "/app/src/components/NavBar.jsx",
          lineNumber: 27,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/app/src/components/NavBar.jsx",
        lineNumber: 25,
        columnNumber: 11
      }, this),
      role === "super_admin" && /* @__PURE__ */ jsxDEV(Fragment, { children: /* @__PURE__ */ jsxDEV(Link, { to: "/super-admin", onClick: () => setOpen(false), children: "Tenants" }, void 0, false, {
        fileName: "/app/src/components/NavBar.jsx",
        lineNumber: 32,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "/app/src/components/NavBar.jsx",
        lineNumber: 31,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "nav-right", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "user-info", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "user-name", children: user?.full_name || user?.email || "User" }, void 0, false, {
            fileName: "/app/src/components/NavBar.jsx",
            lineNumber: 38,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "user-role", children: user?.role }, void 0, false, {
            fileName: "/app/src/components/NavBar.jsx",
            lineNumber: 39,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/src/components/NavBar.jsx",
          lineNumber: 37,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "logout-btn", onClick: () => {
          logout();
          setOpen(false);
        }, children: "Logout" }, void 0, false, {
          fileName: "/app/src/components/NavBar.jsx",
          lineNumber: 41,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/app/src/components/NavBar.jsx",
        lineNumber: 36,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/src/components/NavBar.jsx",
      lineNumber: 22,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/app/src/components/NavBar.jsx",
    lineNumber: 16,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/app/src/components/NavBar.jsx",
    lineNumber: 15,
    columnNumber: 5
  }, this);
}
_s(NavBar, "uE1Uwpf8vQlAV8TFTofbQDdzlgo=", false, function() {
  return [useAuth];
});
_c = NavBar;
var _c;
$RefreshReg$(_c, "NavBar");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/app/src/components/NavBar.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/app/src/components/NavBar.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) {
  return RefreshRuntime.register(type, "/app/src/components/NavBar.jsx " + id);
}
function $RefreshSig$() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBaUJVLFNBT0UsVUFQRjs7QUFqQlYsT0FBT0EsU0FBU0MsZ0JBQWdCO0FBQ2hDLFNBQVNDLFlBQVk7QUFDckIsT0FBT0MsYUFBYTtBQUNwQixPQUFPO0FBRVAsd0JBQXdCQyxTQUFTO0FBQUFDLEtBQUE7QUFDL0IsUUFBTSxFQUFFQyxNQUFNQyxPQUFPLElBQUlKLFFBQVE7QUFDakMsUUFBTSxDQUFDSyxNQUFNQyxPQUFPLElBQUlSLFNBQVMsS0FBSztBQUV0QyxRQUFNUyxPQUFPSixNQUFNSTtBQUVuQixRQUFNQyxXQUFXRCxTQUFTLGdCQUFnQixpQkFBaUJBLFNBQVMsaUJBQWlCLGtCQUFrQjtBQUV2RyxTQUNFLHVCQUFDLFlBQU8sV0FBVSxXQUNoQixpQ0FBQyxTQUFJLFdBQVUsYUFDYjtBQUFBLDJCQUFDLFNBQUksV0FBVSxTQUNiO0FBQUEsNkJBQUMsUUFBSyxJQUFJQyxVQUFVLFdBQVUsY0FBYSxpQ0FBM0M7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUE0RDtBQUFBLE1BQzVELHVCQUFDLFlBQU8sV0FBVSxhQUFZLFNBQVMsTUFBTUYsUUFBUSxDQUFDRCxJQUFJLEdBQUcsY0FBVyxlQUFjLGlCQUF0RjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQXVGO0FBQUEsU0FGekY7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUdBO0FBQUEsSUFFQSx1QkFBQyxTQUFJLFdBQVcsYUFBYUEsT0FBTyxTQUFTLEVBQUUsSUFBSSxpQkFBZUEsTUFDaEU7QUFBQSw2QkFBQyxRQUFLLElBQUlHLFVBQVUsU0FBUyxNQUFNRixRQUFRLEtBQUssR0FBRyx5QkFBbkQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUE0RDtBQUFBLE1BQzNEQyxTQUFTLGtCQUNSLG1DQUNFO0FBQUEsK0JBQUMsUUFBSyxJQUFHLDBCQUF5QixTQUFTLE1BQU1ELFFBQVEsS0FBSyxHQUFHLHdCQUFqRTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXlFO0FBQUEsUUFDekUsdUJBQUMsUUFBSyxJQUFHLHVCQUFzQixTQUFTLE1BQU1BLFFBQVEsS0FBSyxHQUFHLHFCQUE5RDtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQW1FO0FBQUEsV0FGckU7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUdBO0FBQUEsTUFFREMsU0FBUyxpQkFDUixtQ0FDRSxpQ0FBQyxRQUFLLElBQUcsZ0JBQWUsU0FBUyxNQUFNRCxRQUFRLEtBQUssR0FBRyx1QkFBdkQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUE4RCxLQURoRTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBRUE7QUFBQSxNQUdGLHVCQUFDLFNBQUksV0FBVSxhQUNiO0FBQUEsK0JBQUMsU0FBSSxXQUFVLGFBQ2I7QUFBQSxpQ0FBQyxVQUFLLFdBQVUsYUFBYUgsZ0JBQU1NLGFBQWFOLE1BQU1PLFNBQVMsVUFBL0Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBc0U7QUFBQSxVQUN0RSx1QkFBQyxVQUFLLFdBQVUsYUFBYVAsZ0JBQU1JLFFBQW5DO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQXdDO0FBQUEsYUFGMUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUdBO0FBQUEsUUFDQSx1QkFBQyxZQUFPLFdBQVUsY0FBYSxTQUFTLE1BQU07QUFBRUgsaUJBQU87QUFBR0Usa0JBQVEsS0FBSztBQUFBLFFBQUcsR0FBRyxzQkFBN0U7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUFtRjtBQUFBLFdBTHJGO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFNQTtBQUFBLFNBcEJGO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FxQkE7QUFBQSxPQTNCRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBNEJBLEtBN0JGO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0E4QkE7QUFFSjtBQUFDSixHQXpDdUJELFFBQU07QUFBQSxVQUNIRCxPQUFPO0FBQUE7QUFBQVcsS0FEVlY7QUFBTSxJQUFBVTtBQUFBQyxhQUFBRCxJQUFBIiwibmFtZXMiOlsiUmVhY3QiLCJ1c2VTdGF0ZSIsIkxpbmsiLCJ1c2VBdXRoIiwiTmF2QmFyIiwiX3MiLCJ1c2VyIiwibG9nb3V0Iiwib3BlbiIsInNldE9wZW4iLCJyb2xlIiwiaG9tZUhyZWYiLCJmdWxsX25hbWUiLCJlbWFpbCIsIl9jIiwiJFJlZnJlc2hSZWckIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIk5hdkJhci5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IExpbmsgfSBmcm9tIFwicmVhY3Qtcm91dGVyLWRvbVwiO1xyXG5pbXBvcnQgdXNlQXV0aCBmcm9tIFwiLi4vYXV0aC91c2VBdXRoXCI7XHJcbmltcG9ydCBcIi4vTmF2QmFyLmNzc1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTmF2QmFyKCkge1xyXG4gIGNvbnN0IHsgdXNlciwgbG9nb3V0IH0gPSB1c2VBdXRoKCk7XHJcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xyXG5cclxuICBjb25zdCByb2xlID0gdXNlcj8ucm9sZTtcclxuXHJcbiAgY29uc3QgaG9tZUhyZWYgPSByb2xlID09PSBcInN1cGVyX2FkbWluXCIgPyBcIi9zdXBlci1hZG1pblwiIDogcm9sZSA9PT0gXCJ0ZW5hbnRfYWRtaW5cIiA/IFwiL3RlbmFudC1hZG1pblwiIDogXCIvdXNlclwiO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGhlYWRlciBjbGFzc05hbWU9XCJhcHAtbmF2XCI+XHJcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibmF2LWlubmVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJicmFuZFwiPlxyXG4gICAgICAgICAgPExpbmsgdG89e2hvbWVIcmVmfSBjbGFzc05hbWU9XCJicmFuZC1saW5rXCI+TXVsdGkgVGVuYW50IFNhYVM8L0xpbms+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImhhbWJ1cmdlclwiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oIW9wZW4pfSBhcmlhLWxhYmVsPVwiVG9nZ2xlIG1lbnVcIj7imLA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPG5hdiBjbGFzc05hbWU9e2BuYXYtbGlua3MgJHtvcGVuID8gXCJvcGVuXCIgOiBcIlwifWB9IGFyaWEtZXhwYW5kZWQ9e29wZW59PlxyXG4gICAgICAgICAgPExpbmsgdG89e2hvbWVIcmVmfSBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKGZhbHNlKX0+RGFzaGJvYXJkPC9MaW5rPlxyXG4gICAgICAgICAge3JvbGUgPT09IFwidGVuYW50X2FkbWluXCIgJiYgKFxyXG4gICAgICAgICAgICA8PlxyXG4gICAgICAgICAgICAgIDxMaW5rIHRvPVwiL3RlbmFudC1hZG1pbi9wcm9qZWN0c1wiIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oZmFsc2UpfT5Qcm9qZWN0czwvTGluaz5cclxuICAgICAgICAgICAgICA8TGluayB0bz1cIi90ZW5hbnQtYWRtaW4vdXNlcnNcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKGZhbHNlKX0+VXNlcnM8L0xpbms+XHJcbiAgICAgICAgICAgIDwvPlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICAgIHtyb2xlID09PSBcInN1cGVyX2FkbWluXCIgJiYgKFxyXG4gICAgICAgICAgICA8PlxyXG4gICAgICAgICAgICAgIDxMaW5rIHRvPVwiL3N1cGVyLWFkbWluXCIgb25DbGljaz17KCkgPT4gc2V0T3BlbihmYWxzZSl9PlRlbmFudHM8L0xpbms+XHJcbiAgICAgICAgICAgIDwvPlxyXG4gICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm5hdi1yaWdodFwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInVzZXItaW5mb1wiPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInVzZXItbmFtZVwiPnt1c2VyPy5mdWxsX25hbWUgfHwgdXNlcj8uZW1haWwgfHwgXCJVc2VyXCJ9PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInVzZXItcm9sZVwiPnt1c2VyPy5yb2xlfTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwibG9nb3V0LWJ0blwiIG9uQ2xpY2s9eygpID0+IHsgbG9nb3V0KCk7IHNldE9wZW4oZmFsc2UpOyB9fT5Mb2dvdXQ8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvbmF2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvaGVhZGVyPlxyXG4gICk7XHJcbn1cclxuIl0sImZpbGUiOiIvYXBwL3NyYy9jb21wb25lbnRzL05hdkJhci5qc3gifQ==