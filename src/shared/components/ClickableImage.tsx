import "./styles/skeleton.css";
import "./styles/clickable-image.css";

export type ClickableImageConfig = {
  url?: string;
  alt?: string;
  title?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  debugColor?: boolean;
  onClick?: ()=>void;
};

const ClickableImage = ({
  url,
  alt = "image",
  title = "image",
  width = "100%",
  height = "200px",
  borderRadius = "8px",
  className = "",
  debugColor = false,
  onClick
}: ClickableImageConfig) => {
  const styleClasses = [
    "clickable-image-button",
    !url ? "skeleton" : "",
    debugColor ? "debug-color": "",
    !onClick ? "pointer-none": "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={styleClasses}
      onClick={onClick}
      style={{ width, height, borderRadius }}
    >
      {url && (
        <img
          src={url}
          alt={alt}
          title={title}
          loading="lazy"
          style={{ borderRadius }}
        />
      )}
    </button>
  );
};

export default ClickableImage;