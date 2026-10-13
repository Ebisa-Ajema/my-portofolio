import { useEffect, useState } from "react";
import App from "./App";
import AdminApp from "./admin/AdminApp";

const Root = () => {
  const [isAdminRoute, setIsAdminRoute] = useState(() => window.location.hash.startsWith("#/admin"));

  useEffect(() => {
    const updateRoute = () => setIsAdminRoute(window.location.hash.startsWith("#/admin"));
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  return isAdminRoute ? <AdminApp /> : <App />;
};

export default Root;
