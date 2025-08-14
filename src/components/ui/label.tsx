import * as React from "react"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ className, ...props }) => {
  const baseClasses = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;
  
  return <label className={combinedClasses} {...props} />;
}
