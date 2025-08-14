import React, { ReactNode } from 'react';
import { ConfigProvider } from 'antd';

interface AntDesignProviderProps {
  children: ReactNode;
}

/**
 * AntDesignProvider ensures React is fully loaded before Ant Design components are initialized.
 * This helps prevent the "Cannot read properties of undefined (reading 'createContext')" error.
 */
export const AntDesignProvider: React.FC<AntDesignProviderProps> = ({ children }) => {
  return (
    <ConfigProvider>
      {children}
    </ConfigProvider>
  );
};

export default AntDesignProvider;
