import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import PrintableNotice from './PrintableNotice';

interface PreviewSectionProps {
  districtName: string;
  mandalName: string;
  villageName: string;
  startDate: string;
  startTime: string;
  show: boolean;
  headers: string[];
  data: string[][];
  mapping: Record<string, string>;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  districtName,
  mandalName,
  villageName,
  startDate,
  startTime,
  show,
  headers,
  data,
  mapping,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [visibleRows, setVisibleRows] = useState(100);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!show) return null;

  // Create mapping of field names to indices
  const indexMapping: Record<string, number> = {};
  Object.entries(mapping).forEach(([fieldName, csvHeader]) => {
    const headerIndex = headers.indexOf(csvHeader);
    if (headerIndex !== -1) {
      indexMapping[fieldName] = headerIndex;
    }
  });

  // Fields to display in the table
  const requiredFields = [
    { en: 'Survey No', te: 'సర్వే నెం' },
    { en: 'Khata No', te: 'ఖాతా సంఖ్య' },
    { en: 'Pattadar Name', te: 'భూ యజమాని పేరు' },
    { en: 'Relation Name', te: 'భర్త/తండ్రి పేరు' },
  ];

  const optionalFields = [
    { en: 'Mobile Number', te: 'మొబైల్ నెంబరు' },
  ];

  // Always include all fields, both required and optional
  const fields = [...requiredFields, ...optionalFields];

  // Group data by Khata No if it exists in the mapping
  const khataNoField = 'Khata No';
  const hasKhataNo = khataNoField in indexMapping;
  
  let notices: {
    khataNo: string;
    rows: string[][];
    mapping: Record<string, number>;
    fields: { en: string; te: string }[];
  }[] = [];
  
  if (hasKhataNo) {
    const khataGroups: Record<string, string[][]> = {};
    data.forEach(row => {
      const khataNo = row[indexMapping[khataNoField]] || 'Unknown';
      if (!khataGroups[khataNo]) {
        khataGroups[khataNo] = [];
      }
      khataGroups[khataNo].push(row);
    });
    
    notices = Object.entries(khataGroups).map(([khataNo, rows]) => ({
      khataNo,
      rows,
      mapping: indexMapping,
      fields,
    }));
  } else {
    notices = [{
      khataNo: 'All Data',
      rows: data,
      mapping: indexMapping,
      fields,
    }];
  }

  useEffect(() => {
    if (isPrinting) {
      // Load all rows when printing
      setVisibleRows(data.length);
    }
  }, [isPrinting, data.length]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      setVisibleRows(100); // Reset to initial visible rows after printing
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 print:m-0 print:bg-transparent print:static"
    >
      <div className="no-print flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium">Preview</h2>
        <Button onClick={handlePrint} disabled={isPrinting}>
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? 'Preparing Print...' : 'Print'}
        </Button>
      </div>
      
      <div ref={printRef}>
        <PrintableNotice
          districtName={districtName}
          mandalName={mandalName}
          villageName={villageName}
          startDate={startDate}
          startTime={startTime}
          notices={notices.map(notice => ({
            ...notice,
            rows: notice.rows.slice(0, isPrinting ? notice.rows.length : visibleRows)
          }))}
          showHeaderOnWeb={true}
        />
      </div>
    </motion.div>
  );
};

export default PreviewSection;
