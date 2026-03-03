
export type TitleProps = {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string;
  align?: "left" | "center" | "right";
  className?: string;
};

const Title = ({
  text,
  level = 1,
  color = "#111",
  align = "left",
  className = "",
}: TitleProps) => {
  const Tag = `h${level}` as keyof HTMLElementTagNameMap;;

  return (
    <Tag
      className={`title ${className}`}
      style={{ color, textAlign: align }}
    >
      {text}
    </Tag>
  );
};

export default Title;