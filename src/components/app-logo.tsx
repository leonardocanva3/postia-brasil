import Image from "next/image";

type AppLogoProps = Readonly<{
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}>;

const fullSizeClassNames = {
  sm: "w-20",
  md: "w-28",
  lg: "w-32 sm:w-[140px]"
};

const iconSizeClassNames = {
  sm: "size-10",
  md: "size-14",
  lg: "size-20"
};

export function AppLogo({
  variant = "full",
  size = "md",
  className = ""
}: AppLogoProps) {
  const sizeClassName =
    variant === "icon" ? iconSizeClassNames[size] : fullSizeClassNames[size];
  const image = (
    <Image
      alt="PostIA Brasil"
      className={`${sizeClassName} h-auto max-w-[140px] shrink-0 object-contain`}
      height={1024}
      priority={size === "lg"}
      src="/logo-postia-brasil.png"
      width={1024}
    />
  );

  if (variant === "icon") {
    return <div className={`inline-flex items-center ${className}`}>{image}</div>;
  }

  return (
    <div className={`inline-flex max-w-[140px] items-center ${className}`}>
      {image}
    </div>
  );
}
