import { Button } from "../../components/ui/Button";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { ClipboardCheck, FileText, Filter, Plus, Search, Wrench } from "lucide-react";
import React, { useState } from "react";
import JobCard from "../../components/WorkshopManagement/JobCard";
import JobCardKanbanBoard from "./JobCardKanbanBoard";

interface JobCardManagementProps {
  activeTab?: "open" | "completed" | "kanban" | "templates";
}

const JobCardManagement: React.FC<JobCardManagementProps> = ({ activeTab = "open" }) => {
  const [currentTab, setCurrentTab] = useState<"open" | "completed" | "kanban" | "templates">(
    activeTab
  );
  const [showJobCardModal, setShowJobCardModal] = useState(false);

  // Handler to open the Job Card modal
  const onClick = () => setShowJobCardModal(true);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Card Management</h2>
          <p className="text-gray-600">Create and manage workshop job cards</p>
        </div>
        <div className="flex space-x-2">
          <Button icon={<Plus className="w-4 h-4" />} onClick={onClick}>
            New Job Card
          </Button>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(value) => setCurrentTab(value as "open" | "templates" | "kanban")}
      >
        <TabsList>
          <TabsTrigger value="open" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span>Open Job Cards</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Job Card Templates</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            <span>Kanban Board</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          <Card>
            <CardHeader
              title="Open Job Cards"
              action={
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" icon={<Filter className="w-4 h-4" />}>
                    Filter
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search job cards..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              }
            />
            <CardContent>
              <div className="text-center py-8">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No open job cards</h3>
                <p className="mt-1 text-sm text-gray-500">Create a new job card to get started</p>
                <div className="mt-6">
                  <Button icon={<Plus className="w-4 h-4" />} onClick={onClick}>
                    Create Job Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <JobCardKanbanBoard />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader
              title="Job Card Templates"
              action={
                <div className="flex items-center space-x-2">
                  <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                    Create Template
                  </Button>
                </div>
              }
            />
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No templates available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create a job card template to get started
                </p>
                <div className="mt-6">
                  <Button icon={<Plus className="w-4 h-4" />}>Create Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800">Job Card Features</h3>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div className="space-y-2">
            <p>• Create and manage workshop job cards</p>
            <p>• Track repair and maintenance tasks</p>
            <p>• Assign technicians to specific jobs</p>
            <p>• Monitor parts usage and costs</p>
          </div>
          <div className="space-y-2">
            <p>• Generate job card from failed inspections</p>
            <p>• Calculate labor and parts costs</p>
            <p>• Record service history per vehicle</p>
            <p>• Maintain full audit trail of all work</p>
          </div>
        </div>
      </div>

      {/* Job Card Modal */}
      <Modal
        isOpen={showJobCardModal}
        onClose={() => setShowJobCardModal(false)}
        title="Job Card"
        maxWidth="2xl"
      >
        <JobCard />
      </Modal>
    </div>
  );
};

export default JobCardManagement;
