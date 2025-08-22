import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Privacy Policy link component
 */
const PrivacyPolicyLink: React.FC<{className?: string}> = ({ className = '' }) => {
  return (
    <Link
      to="/privacy-policy"
      className={`text-blue-600 hover:text-blue-800 underline ${className}`}
    >
      Privacy Policy
    </Link>
  );
};

export default PrivacyPolicyLink;





























