import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/auth/AuthProvider.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a05eb773"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=a05eb773"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useEffect = __vite__cjsImport1_react["useEffect"]; const useState = __vite__cjsImport1_react["useState"]; const useCallback = __vite__cjsImport1_react["useCallback"];
import api from "/src/api/axios.js";
import * as jwtDecodeModule from "/node_modules/.vite/deps/jwt-decode.js?v=1dd45694";
const jwtDecode = jwtDecodeModule?.default || jwtDecodeModule?.jwtDecode || jwtDecodeModule;
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=51c5d2b0";
import AuthContext from "/src/auth/context.js";
export default function AuthProvider({ children }) {
  _s();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const logoutTimerRef = React.useRef(null);
  const logoutRef = React.useRef(null);
  const logout = React.useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    navigate("/login");
  }, [navigate]);
  React.useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);
  const scheduleAutoLogout = useCallback((token) => {
    try {
      const { exp } = jwtDecode(token) || {};
      if (!exp) return;
      const ms = Math.max(0, exp * 1e3 - Date.now());
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (ms <= 0) {
        logoutRef.current && logoutRef.current();
        return;
      }
      const t = setTimeout(() => {
        logoutRef.current && logoutRef.current();
      }, ms);
      logoutTimerRef.current = t;
    } catch {
    }
  }, []);
  const verify = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
      scheduleAutoLogout(token);
    } catch (err) {
      console.error("Auth verification failed:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleAutoLogout]);
  useEffect(() => {
    verify();
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [verify]);
  const login = async (token) => {
    localStorage.setItem("token", token);
    await verify();
  };
  return /* @__PURE__ */ jsxDEV(AuthContext.Provider, { value: { user, loading, login, logout, verify }, children }, void 0, false, {
    fileName: "/app/src/auth/AuthProvider.jsx",
    lineNumber: 92,
    columnNumber: 5
  }, this);
}
_s(AuthProvider, "oK1HaJ6K5z0ChV9KpI3IjL+OXCo=", false, function() {
  return [useNavigate];
});
_c = AuthProvider;
var _c;
$RefreshReg$(_c, "AuthProvider");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/app/src/auth/AuthProvider.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/app/src/auth/AuthProvider.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) {
  return RefreshRuntime.register(type, "/app/src/auth/AuthProvider.jsx " + id);
}
function $RefreshSig$() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}

//# sourceMappingURL=data:application/json;base64,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QSxFQUNmO0FBRUEsU0FDRSx1QkFBQyxZQUFZLFVBQVosRUFBcUIsT0FBTyxFQUFFdkIsTUFBTUUsU0FBUzZCLE9BQU92QixRQUFRZSxPQUFPLEdBQ2pFekIsWUFESDtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBRUE7QUFFSjtBQUFDQyxHQXhGdUJGLGNBQVk7QUFBQSxVQUdqQkYsV0FBVztBQUFBO0FBQUFzQyxLQUhOcEM7QUFBWSxJQUFBb0M7QUFBQUMsYUFBQUQsSUFBQSIsIm5hbWVzIjpbIlJlYWN0IiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJ1c2VDYWxsYmFjayIsImFwaSIsImp3dERlY29kZU1vZHVsZSIsImp3dERlY29kZSIsImRlZmF1bHQiLCJ1c2VOYXZpZ2F0ZSIsIkF1dGhDb250ZXh0IiwiQXV0aFByb3ZpZGVyIiwiY2hpbGRyZW4iLCJfcyIsInVzZXIiLCJzZXRVc2VyIiwibG9hZGluZyIsInNldExvYWRpbmciLCJuYXZpZ2F0ZSIsImxvZ291dFRpbWVyUmVmIiwidXNlUmVmIiwibG9nb3V0UmVmIiwibG9nb3V0IiwibG9jYWxTdG9yYWdlIiwicmVtb3ZlSXRlbSIsImN1cnJlbnQiLCJjbGVhclRpbWVvdXQiLCJzY2hlZHVsZUF1dG9Mb2dvdXQiLCJ0b2tlbiIsImV4cCIsIm1zIiwiTWF0aCIsIm1heCIsIkRhdGUiLCJub3ciLCJ0Iiwic2V0VGltZW91dCIsInZlcmlmeSIsImdldEl0ZW0iLCJyZXMiLCJnZXQiLCJkYXRhIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibG9naW4iLCJzZXRJdGVtIiwiX2MiLCIkUmVmcmVzaFJlZyQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiQXV0aFByb3ZpZGVyLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tIFwicmVhY3RcIjtcclxuaW1wb3J0IGFwaSBmcm9tIFwiLi4vYXBpL2F4aW9zXCI7XHJcbmltcG9ydCAqIGFzIGp3dERlY29kZU1vZHVsZSBmcm9tIFwiand0LWRlY29kZVwiO1xyXG5jb25zdCBqd3REZWNvZGUgPSBqd3REZWNvZGVNb2R1bGU/LmRlZmF1bHQgfHwgand0RGVjb2RlTW9kdWxlPy5qd3REZWNvZGUgfHwgand0RGVjb2RlTW9kdWxlO1xyXG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XHJcbmltcG9ydCBBdXRoQ29udGV4dCBmcm9tIFwiLi9jb250ZXh0XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBdXRoUHJvdmlkZXIoeyBjaGlsZHJlbiB9KSB7XHJcbiAgY29uc3QgW3VzZXIsIHNldFVzZXJdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XHJcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xyXG4gIGNvbnN0IGxvZ291dFRpbWVyUmVmID0gUmVhY3QudXNlUmVmKG51bGwpO1xyXG4gIGNvbnN0IGxvZ291dFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcclxuXHJcbiAgY29uc3QgbG9nb3V0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ0b2tlblwiKTtcclxuICAgIHNldFVzZXIobnVsbCk7XHJcbiAgICBpZiAobG9nb3V0VGltZXJSZWYuY3VycmVudCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQobG9nb3V0VGltZXJSZWYuY3VycmVudCk7XHJcbiAgICAgIGxvZ291dFRpbWVyUmVmLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgbmF2aWdhdGUoXCIvbG9naW5cIik7XHJcbiAgfSwgW25hdmlnYXRlXSk7XHJcblxyXG4gIC8vIEtlZXAgYSByZWYgdG8gdGhlIGxhdGVzdCBsb2dvdXQgdG8gYXZvaWQgVERaIC8gSE1SIG9yZGVyaW5nIGlzc3Vlc1xyXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBsb2dvdXRSZWYuY3VycmVudCA9IGxvZ291dDtcclxuICB9LCBbbG9nb3V0XSk7XHJcblxyXG4gIGNvbnN0IHNjaGVkdWxlQXV0b0xvZ291dCA9IHVzZUNhbGxiYWNrKCh0b2tlbikgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgeyBleHAgfSA9IGp3dERlY29kZSh0b2tlbikgfHwge307XHJcbiAgICAgIGlmICghZXhwKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IG1zID0gTWF0aC5tYXgoMCwgZXhwICogMTAwMCAtIERhdGUubm93KCkpO1xyXG5cclxuICAgICAgaWYgKGxvZ291dFRpbWVyUmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChsb2dvdXRUaW1lclJlZi5jdXJyZW50KTtcclxuXHJcbiAgICAgIGlmIChtcyA8PSAwKSB7XHJcbiAgICAgICAgLy8gdG9rZW4gYWxyZWFkeSBleHBpcmVkXHJcbiAgICAgICAgbG9nb3V0UmVmLmN1cnJlbnQgJiYgbG9nb3V0UmVmLmN1cnJlbnQoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBsb2dvdXRSZWYuY3VycmVudCAmJiBsb2dvdXRSZWYuY3VycmVudCgpO1xyXG4gICAgICB9LCBtcyk7XHJcbiAgICAgIGxvZ291dFRpbWVyUmVmLmN1cnJlbnQgPSB0O1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8vIGlnbm9yZSBzY2hlZHVsZSBlcnJvcnNcclxuICAgIH1cclxuICB9LCBbXSk7XHJcblxyXG4gIGNvbnN0IHZlcmlmeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIik7XHJcbiAgICBpZiAoIXRva2VuKSB7XHJcbiAgICAgIHNldFVzZXIobnVsbCk7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXBpLmdldChcIi9hdXRoL21lXCIpO1xyXG4gICAgICBzZXRVc2VyKHJlcy5kYXRhLmRhdGEpO1xyXG4gICAgICBzY2hlZHVsZUF1dG9Mb2dvdXQodG9rZW4pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoIHZlcmlmaWNhdGlvbiBmYWlsZWQ6XCIsIGVycik7XHJcbiAgICAgIC8vIHRva2VuIGludmFsaWQgb3IgZXhwaXJlZFxyXG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInRva2VuXCIpO1xyXG4gICAgICBzZXRVc2VyKG51bGwpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfSwgW3NjaGVkdWxlQXV0b0xvZ291dF0pO1xyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICB2ZXJpZnkoKTtcclxuXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBpZiAobG9nb3V0VGltZXJSZWYuY3VycmVudCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChsb2dvdXRUaW1lclJlZi5jdXJyZW50KTtcclxuICAgICAgICBsb2dvdXRUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9LCBbdmVyaWZ5XSk7XHJcblxyXG4gIGNvbnN0IGxvZ2luID0gYXN5bmMgKHRva2VuKSA9PiB7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRva2VuXCIsIHRva2VuKTtcclxuICAgIGF3YWl0IHZlcmlmeSgpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgdXNlciwgbG9hZGluZywgbG9naW4sIGxvZ291dCwgdmVyaWZ5IH19PlxyXG4gICAgICB7Y2hpbGRyZW59XHJcbiAgICA8L0F1dGhDb250ZXh0LlByb3ZpZGVyPlxyXG4gICk7XHJcbn1cclxuIl0sImZpbGUiOiIvYXBwL3NyYy9hdXRoL0F1dGhQcm92aWRlci5qc3gifQ==