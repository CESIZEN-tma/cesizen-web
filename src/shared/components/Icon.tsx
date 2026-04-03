import type { IconType } from "react-icons";

export type IconProps = {
  icon: IconType;          
  size?: number;  
  color?: string;          
  className?: string;      
  onClick?: () => void;    
  rounded?: boolean;       
  backgroundColor?: string; 
};

const Icon = ({
  icon: IconComponent,
  size = 24,
  color = "currentColor",
  className = "",
  onClick,
  rounded = false,
  backgroundColor = "transparent",
}: IconProps) => {
  return (
    <div
      className={`icon-wrapper ${rounded ? "icon-rounded" : ""} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        backgroundColor: rounded ? backgroundColor : "transparent",
        borderRadius: rounded ? "50%" : "0",
        width: rounded ? size + 12 : "auto",
        height: rounded ? size + 12 : "auto",
      }}
      onClick={onClick}
    >
      <IconComponent size={size} color={color} />
    </div>
  );
};

export default Icon;