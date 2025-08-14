// src/components/layout/Footer.tsx
import React from "react";

/**
 * Footer Component
 *
 * Provides a consistent footer across the application
 * with links to important resources and copyright information.
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Fleet Manager</h3>
            <p className="text-gray-400">
              Advanced fleet management system for heavy vehicle operations. Track, manage, and
              optimize your fleet performance.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/forms" className="text-gray-400 hover:text-white">
                  Forms
                </a>
              </li>
              <li>
                <a href="/fleet" className="text-gray-400 hover:text-white">
                  Fleet Management
                </a>
              </li>
              <li>
                <a href="/trips" className="text-gray-400 hover:text-white">
                  Trip Planning
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-400 hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/documentation" className="text-gray-400 hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/api" className="text-gray-400 hover:text-white">
                  API Reference
                </a>
              </li>
              <li>
                <a href="/status" className="text-gray-400 hover:text-white">
                  System Status
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Email: support@fleetmanager.com</li>
              <li className="text-gray-400">Phone: +1 (555) 123-4567</li>
              <li className="text-gray-400">Hours: Mon-Fri, 8am-6pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; {currentYear} Fleet Manager. All rights reserved.</p>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </a>
            <a href="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="/cookies" className="text-gray-400 hover:text-white">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
