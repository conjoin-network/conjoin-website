import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

const baseClass = "mx-auto w-full max-w-6xl px-4 sm:px-5 md:px-6";

export default function Container({ children, className }: ContainerProps) {
  return <div className={className ? `${baseClass} ${className}` : baseClass}>{children}</div>;
}
