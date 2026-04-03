import type { LayoutProps } from "../types";
import Footer from "./Footer";
import Header from "./Header";
import "../css/Main.css";

const Layout = ({ config, children }: LayoutProps) => {
  console.log(config);
  return (
    <>
      {config.header && <Header/>}
      <main>{children}</main>
      {config.footer && <Footer/>}
    </>
  );
};

export default Layout;
