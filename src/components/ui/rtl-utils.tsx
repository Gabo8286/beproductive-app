import React from "react";
import { useRTL } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

interface RTLProviderProps {
  children: React.ReactNode;
}

/**
 * RTL Provider component that handles document direction
 */
export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { isRTL, dir } = useRTL();

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
  }, [dir]);

  return (
    <div className={cn("rtl-provider", isRTL && "rtl-layout")}>{children}</div>
  );
};

interface RTLAwareProps {
  children: React.ReactNode;
  className?: string;
  rtlClassName?: string;
  ltrClassName?: string;
}

/**
 * Component that applies different classes based on RTL direction
 */
export const RTLAware: React.FC<RTLAwareProps> = ({
  children,
  className,
  rtlClassName,
  ltrClassName,
}) => {
  const { isRTL, rtlClass } = useRTL();

  const combinedClassName = cn(
    className,
    isRTL ? rtlClassName : ltrClassName,
    rtlClass(ltrClassName || "", rtlClassName || ""),
  );

  return <div className={combinedClassName}>{children}</div>;
};

/**
 * Hook for creating RTL-aware inline styles
 */
export const useRTLStyles = () => {
  const { isRTL } = useRTL();

  return {
    marginStart: (value: string | number) => ({
      [isRTL ? "marginRight" : "marginLeft"]: value,
    }),
    marginEnd: (value: string | number) => ({
      [isRTL ? "marginLeft" : "marginRight"]: value,
    }),
    paddingStart: (value: string | number) => ({
      [isRTL ? "paddingRight" : "paddingLeft"]: value,
    }),
    paddingEnd: (value: string | number) => ({
      [isRTL ? "paddingLeft" : "paddingRight"]: value,
    }),
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    transform: (shouldFlip: boolean = true) =>
      shouldFlip && isRTL ? "scaleX(-1)" : "none",
  };
};

/**
 * RTL-aware icon component
 */
interface RTLIconProps {
  icon: React.ComponentType<any>;
  shouldFlip?: boolean;
  className?: string;
  [key: string]: any;
}

export const RTLIcon: React.FC<RTLIconProps> = ({
  icon: Icon,
  shouldFlip = false,
  className,
  ...props
}) => {
  const { isRTL } = useRTL();

  return (
    <Icon
      className={cn(className, shouldFlip && isRTL && "rtl-flip")}
      {...props}
    />
  );
};
