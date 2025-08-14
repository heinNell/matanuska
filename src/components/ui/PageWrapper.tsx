import React from 'react';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, children }) => {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <div className="bg-white shadow rounded-lg p-6">{children}</div>
    </div>
  );
};

export default PageWrapper;
