import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardComponent extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
}

export const Card: CardComponent = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden card-hover-effect ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode; // Added action prop to support custom actions
  children?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon, // Destructure the icon prop
  action, // Destructure the action prop
  children,
  className = "",
}) => {
  return (
    <div
      className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center ${className}`}
    >
      <div className="flex flex-col">
        {icon && <div className="mr-2">{icon}</div>}
        {title && <h3 className="text-xl font-semibold text-slate-800">{title}</h3>}
        {subtitle && <div className="mt-1">{subtitle}</div>}
      </div>
      {action && <div>{action}</div>} {/* Render the action prop */}
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className = "" }) => {
  return (
    <div className={`px-6 py-3 bg-slate-50 border-t border-slate-200 ${className}`}>{children}</div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return <h4 className={className}>{children}</h4>;
};
