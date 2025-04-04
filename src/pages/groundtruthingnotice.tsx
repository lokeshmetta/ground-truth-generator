
import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import FormSection from "@/components/FormSection";
import MappingTable from "@/components/MappingTable";
import PreviewSection from "@/components/PreviewSection";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText } from "lucide-react";

const Index: React.FC = () => {
  // Form state
  const [districtName, setDistrictName] = useState("");
  const [mandalName, setMandalName] = useState("");
  const [villageName, setVillageName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notificationNumber, setNotificationNumber] = useState("");

  // CSV data state
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [showMapping, setShowMapping] = useState(false);

  // Mapping and preview state
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const handleFileUpload = (headers: string[], data: string[][]) => {
    setHeaders(headers);
    setData(data);
    setShowMapping(true);
    setShowPreview(false);

    toast({
      title: "CSV Uploaded Successfully",
      description: `${data.length} rows loaded. Please map the columns.`,
    });
  };

  const handleMappingSubmit = (mapping: Record<string, string>) => {
    setMapping(mapping);
    setShowPreview(true);

    toast({
      title: "Column Mapping Complete",
      description: "Preview generated. You can now print the notices.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-background to-secondary/20 overflow-hidden w-full"
    >
      <div className="container mx-auto px-2 sm:px-4 py-8 max-w-6xl w-full overflow-hidden">
        <div className="whitespace-nowrap">
          <Header />
        </div>

        <div className="mt-8 space-y-8 print:m-0 w-full overflow-hidden">
          <FormSection
            onFileUpload={handleFileUpload}
            districtName={districtName}
            setDistrictName={setDistrictName}
            mandalName={mandalName}
            setMandalName={setMandalName}
            villageName={villageName}
            setVillageName={setVillageName}
            startDate={startDate}
            setStartDate={setStartDate}
            startTime={startTime}
            setStartTime={setStartTime}
            notificationNumber={notificationNumber}
            setNotificationNumber={setNotificationNumber}
          />

          <MappingTable
            headers={headers}
            show={showMapping}
            onMappingSubmit={handleMappingSubmit}
            onPreview={() => setShowPreview(true)}
          />

          <PreviewSection
            districtName={districtName}
            mandalName={mandalName}
            villageName={villageName}
            startDate={startDate}
            startTime={startTime}
            notificationNumber={notificationNumber}
            show={showPreview}
            headers={headers}
            data={data}
            mapping={mapping}
          />
        </div>
      </div>

      {showPreview && (
        <div className="fixed bottom-8 right-8 print:hidden z-50">
          {showActionMenu ? (
            <div className="flex flex-col gap-2 mb-2 animate-fade-in">
              <Button
                onClick={() => {
                  const previewSection = document.querySelector('.preview-section');
                  const downloadWordButton = previewSection?.querySelector('button:nth-child(1)');
                  if (downloadWordButton) {
                    (downloadWordButton as HTMLButtonElement).click();
                  }
                  setShowActionMenu(false);
                }}
                className="shadow-lg bg-blue-600 hover:bg-blue-500 text-white rounded-full h-12 w-12 flex items-center justify-center"
                size="icon"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => {
                  const previewSection = document.querySelector('.preview-section');
                  const downloadPDFButton = previewSection?.querySelector('button:nth-child(2)');
                  if (downloadPDFButton) {
                    (downloadPDFButton as HTMLButtonElement).click();
                  }
                  setShowActionMenu(false);
                }}
                className="shadow-lg bg-green-600 hover:bg-green-500 text-white rounded-full h-12 w-12 flex items-center justify-center"
                size="icon"
              >
                <FileText className="h-5 w-5" />
              </Button>
              <Button
                onClick={handlePrint}
                className="shadow-lg bg-primary hover:bg-primary/90 text-white rounded-full h-12 w-12 flex items-center justify-center"
                size="icon"
              >
                <Printer className="h-5 w-5" />
              </Button>
            </div>
          ) : null}
          <Button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="flex items-center gap-2 shadow-lg bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 justify-center"
            size="icon"
          >
            {showActionMenu ? (
              <span className="text-xl">×</span>
            ) : (
              <Printer className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default Index;
