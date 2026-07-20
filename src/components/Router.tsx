import { useEffect, useState, createContext, useContext, ReactNode, MouseEvent } from "react";

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  // Normalize initial path to fallback to /home if root
  const getInitialPath = () => {
    const path = window.location.pathname;
    return path === "/" ? "/home" : path;
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname === "/" ? "/home" : window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    const normalized = path === "/" ? "/home" : path;
    window.history.pushState(null, "", normalized);
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export function Link({ to, children, className }: LinkProps) {
  const { navigate, currentPath } = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to);
  };

  const isActive = currentPath === to;

  return (
    <a
      href={to}
      onClick={handleClick}
      className={`${className} ${isActive ? "text-[#c67f43]" : ""}`}
    >
      {children}
    </a>
  );
}

interface RouteProps {
  path: string;
  element: ReactNode;
}

export function Route({ path, element }: RouteProps) {
  const { currentPath } = useRouter();
  
  if (currentPath !== path) return null;
  return <>{element}</>;
}
