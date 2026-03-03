import { IoIosLogOut } from "react-icons/io";
import ClickableImage from "../../../shared/components/ClickableImage";
import Icon from "../../../shared/components/Icon";
import "../css/Header.css";
const Header = () => {
  return (
    <header>
      <ClickableImage
        url={"/adaptive-icon.png"}
        width="auto"
        height="100%"
        borderRadius="50%"
      />

        <h1>CesiZen</h1>

      <Icon
        icon={IoIosLogOut}
        size={32}
        color="#ffff"
        rounded={true}
        onClick={()=>alert("test")}
      />
    </header>
  );
};

export default Header;
