import { IoIosLogOut } from "react-icons/io";
import ClickableImage from "../../../shared/components/ClickableImage";
import Icon from "../../../shared/components/Icon";
import "../css/Header.css";
import { useNavigate } from "react-router-dom";
import Title from "../../../shared/components/Title";
const Header = () => {
  const navigate = useNavigate();
  return (
    <header>
      <ClickableImage
        url={"/adaptive-icon.png"}
        width="auto"
        height="100%"
        borderRadius="50%"
        onClick={()=>navigate("/")}
      />

        <Title level={1} text="CesiZen" color="#FFFF" />

      <Icon
        icon={IoIosLogOut}
        size={44}
        color="#ffff"
        rounded={true}
        onClick={()=>alert("log out")}
      />
    </header>
  );
};

export default Header;
