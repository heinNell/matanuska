import { ChevronRight, FileQuestion, Settings } from "lucide-react";
import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "../ui/Button";

interface GenericPlaceholderPageProps {
  title?: string;
  description?: string;
  showActionButton?: boolean;
  actionButtonText?: string;
  actionButtonLink?: string;
}

const GenericPlaceholderPage: React.FC<GenericPlaceholderPageProps> = ({
  title,
  description,
  showActionButton = true,
  actionButtonText = "Configure This Page",
  actionButtonLink = "#",
}) => {
  const location = useLocation();
  const params = useParams();

  // Generate a title based on the route if none is provided
  const generateTitleFromRoute = () => {
    const path = location.pathname;
    let generatedTitle = "";

    // Extract the main section from the path
    if (path.includes("/diesel/")) {
      generatedTitle = "Diesel Budget";
    } else if (path.includes("/drivers/")) {
      if (path.includes("/licenses")) {
        generatedTitle = "Driver Licenses";
      } else if (path.includes("/training")) {
        generatedTitle = "Driver Training";
      } else if (path.includes("/performance")) {
        generatedTitle = "Driver Performance";
      } else if (path.includes("/scheduling")) {
        generatedTitle = "Driver Scheduling";
      } else if (path.includes("/hours")) {
        generatedTitle = "Driver Hours";
      } else if (path.includes("/profiles/")) {
        const driverId = params.id;
        if (path.includes("/edit")) {
          generatedTitle = `Edit Driver ${driverId}`;
        } else {
          generatedTitle = `Driver Profile ${driverId}`;
        }
      } else {
        generatedTitle = "Drivers Section";
      }
    }

    return generatedTitle || "Coming Soon";
  };

  const pageTitle = title || generateTitleFromRoute();
  const pageDescription =
    description || "This feature is currently in development and will be available soon.";

  // Generate breadcrumbs based on the current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter((segment) => segment);

    return (
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-gray-700">
          Home
        </a>
        <ChevronRight className="w-4 h-4 mx-1" />

        {pathSegments.map((segment, index) => {
          // Don't make the last segment a link and handle special cases
          if (index === pathSegments.length - 1) {
            return (
              <span key={segment} className="text-gray-700">
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </span>
            );
          }

          // Build the path for this breadcrumb
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`;

          return (
            <React.Fragment key={segment}>
              <a href={path} className="hover:text-gray-700">
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </a>
              <ChevronRight className="w-4 h-4 mx-1" />
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {generateBreadcrumbs()}

      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-50 p-3 rounded-full">
            <FileQuestion className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">{pageDescription}</p>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-4">
              This page is currently being developed as part of our system enhancement.
            </p>

            {showActionButton && (
              <Link to={actionButtonLink || "#"}>
                <Button icon={<Settings className="w-4 h-4" />} variant="primary">
                  {actionButtonText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>If you need immediate access to this feature, please contact support.</p>
      </div>
    </div>
  );
};

export default GenericPlaceholderPage;
