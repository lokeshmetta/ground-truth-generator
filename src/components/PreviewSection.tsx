
import React, { useRef } from 'react';
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
  const fields = [
    { en: 'Survey No', te: 'సర్వే నెం' },
    { en: 'Khata No', te: 'ఖాతా సంఖ్య' },
    { en: 'Pattadar Name', te: 'భూ యజమాని పేరు' },
    { en: 'Relation Name', te: 'భర్త/తండ్రి పేరు' },
    { en: 'Mobile Number', te: 'మొబైల్ నెంబరు' },
  ];

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

  const handlePrint = () => {
    window.print();
  };

  const teluguHeaderContent = `
    <h3>ఫారం-19</h3>
    <h3>భూ యాజమాన్య దారులకు నోటీసు</h3>
    <h3>భూ నిజ నిర్దారణ కొరకు</h3>
    <p>
      1) సర్వే సహాయక సంచాలకులు Assistant Director వారి నోటిఫికేషన్ నెం. 6(i), అనుసరించి, ${districtName || '____________________'} జిల్లా,
      ${mandalName || '_____________________'} మండలం, ${villageName || '____________________'} గ్రామములో సీమానిర్ణయం (demarcation) మరియు సర్వే పనులు
      ${startDate || '_____________'} తేదీన ${startTime || '________'} గం.ని.లకు ప్రారంభిచబడును అని తెలియజేయడమైనది.<br />
      2) సర్వే మరియు సరిహద్దుల చట్టం, 1923లోని నియమ నిబంధనలు అనుసరించి సర్వే సమయం నందు ఈ క్రింది షెడ్యూల్ లోని భూ
      యజమానులు భూమి వద్ద హాజరై మీ పొలము యొక్క సరిహద్దులను చూపించి, తగిన సమాచారం మరియు అవసరమైన సహాయ సహకారములు
      అందించవలసినదిగా తెలియజేయడమైనది.
    </p>
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <div className="no-print flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium">Preview</h2>
        <Button 
          onClick={handlePrint} 
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Notices
        </Button>
      </div>

      <Card className="glass-panel">
        <div className="no-print p-6 telugu-text" dangerouslySetInnerHTML={{ __html: teluguHeaderContent }} />
        
        <div className="p-4" ref={printRef}>
          <PrintableNotice
            districtName={districtName}
            mandalName={mandalName}
            villageName={villageName}
            startDate={startDate}
            startTime={startTime}
            notices={notices}
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default PreviewSection;
