import React from "react";

// Type definition for Ant Design's default export
interface AntDesignModule {
  Card: React.ComponentType<any>;
  Table: React.ComponentType<any>;
  Button: React.ComponentType<any>;
  Input: React.ComponentType<any>;
  // Add other components you need...
}

// Create a context for Ant Design components
const AntDesignContext = React.createContext<AntDesignModule | null>(null);

// Wrapper component
export const AntDesignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [antd, setAntd] = React.useState<AntDesignModule | null>(null);

  React.useEffect(() => {
    import("antd").then((module) => {
      setAntd({
        Card: module.default.Card,
        Table: module.default.Table,
        Button: module.default.Button,
        Input: module.default.Input,
        // Initialize other components...
      });
    });
  }, []);

  if (!antd) {
    return <div>Loading Ant Design...</div>;
  }

  return <AntDesignContext.Provider value={antd}>{children}</AntDesignContext.Provider>;
};

// Hook to access Ant Design components
export const useAntDesign = () => {
  const context = React.useContext(AntDesignContext);
  if (!context) {
    throw new Error("useAntDesign must be used within an AntDesignProvider");
  }
  return context;
};

// Individual component wrappers
export const Card: React.FC<any> = (props) => {
  const { Card: AntCard } = useAntDesign();
  return <AntCard {...props} />;
};

export const Button: React.FC<any> = (props) => {
  const { Button: AntButton } = useAntDesign();
  return <AntButton {...props} />;
};

// Add more component wrappers as needed...

// Default export
export default {
  Card,
  Button,
  // Export other components...
};
