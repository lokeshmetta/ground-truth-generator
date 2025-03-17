
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import FormSection from '@/components/FormSection';
import MappingTable from '@/components/MappingTable';
import PreviewSection from '@/components/PreviewSection';
import { toast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  // Form state
  const [districtName, setDistrictName] = useState('');
  const [mandalName, setMandalName] = useState('');
  const [villageName, setVillageName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  
  // CSV data state
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [showMapping, setShowMapping] = useState(false);
  
  // Mapping and preview state
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-background to-secondary/20 overflow-x-hidden w-full"
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl w-full">
        <Header />
        
        <div className="mt-8 space-y-8 print:m-0 w-full">
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
            show={showPreview}
            headers={headers}
            data={data}
            mapping={mapping}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
