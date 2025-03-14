
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import PrintableNotice from './PrintableNotice';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from '@/components/ui/use-toast';

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

  const indexMapping: Record<string, number> = {};
  Object.entries(mapping).forEach(([fieldName, csvHeader]) => {
    const headerIndex = headers.indexOf(csvHeader);
    if (headerIndex !== -1) {
      indexMapping[fieldName] = headerIndex;
    }
  });

  const requiredFields = [
    { en: 'Survey No', te: 'సర్వే నెం' },
    { en: 'Khata No', te: 'ఖాతా సంఖ్య' },
    { en: 'Pattadar Name', te: 'భూ యజమాని పేరు' },
    { en: 'Relation Name', te: 'భర్త/తండ్రి పేరు' },
  ];

  const optionalFields = [
    { en: 'Mobile Number', te: 'మొబైల్ నెంబరు' },
  ];

  const fields = [...requiredFields, ...optionalFields];

  const hasKhataNo = 'Khata No' in indexMapping;
  
  let notices: {
    khataNo: string;
    rows: string[][];
    mapping: Record<string, number>;
    fields: { en: string; te: string }[];
  }[] = [];
  
  if (hasKhataNo) {
    const khataGroups: Record<string, string[][]> = {};
    data.forEach(row => {
      const khataNo = row[indexMapping['Khata No']] || 'Unknown';
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

  const prepareForPDF = () => {
    if (!printRef.current) return;
    
    // Clone the printRef content for PDF preparation
    const pdfContent = printRef.current.cloneNode(true) as HTMLElement;
    
    // Add print-specific classes to make it look like print mode
    const noticeElements = pdfContent.querySelectorAll('.khata-group');
    noticeElements.forEach(notice => {
      // Show the Telugu header in the PDF
      const headerElement = notice.querySelector('.telugu-header-print');
      if (headerElement) {
        headerElement.classList.remove('hidden-on-web');
      }
    });
    
    // Create a temporary container to append our clone to
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(pdfContent);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm'; // A4 width
    document.body.appendChild(tempContainer);
    
    return { tempContainer, pdfContent };
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Create temporary elements that look like the print version
      const { tempContainer, pdfContent } = prepareForPDF() || {};
      if (!tempContainer || !pdfContent) return;

      const elements = pdfContent.querySelectorAll('.khata-group');

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        
        // Show header for each PDF page
        const headerElement = element.querySelector('.telugu-header-print');
        if (headerElement) {
          headerElement.classList.remove('hidden-on-web');
          (headerElement as HTMLElement).style.display = 'block';
        }
        
        // Apply print-specific styling
        element.classList.add('pdf-page');
        
        const canvas = await html2canvas(element, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: 'white',
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      // Clean up the temporary elements
      document.body.removeChild(tempContainer);
      
      pdf.save(`land-notices-${villageName || 'village'}.pdf`);
      
      toast({
        title: "PDF Downloaded Successfully",
        description: "Land notices have been saved to your device.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive",
      });
    }
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
        <div className="flex gap-3">
          <Button 
            onClick={handleDownload}
            className="flex items-center gap-2"
            variant="secondary"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button 
            onClick={handlePrint} 
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Notices
          </Button>
        </div>
      </div>

      <Card className="glass-panel print:bg-transparent print:static">
        <div className="p-6 telugu-text no-print">
          <h3 className="text-center font-bold">ఫారం-19</h3>
          <h3 className="text-center font-bold">భూ యాజమాన్య దారులకు నోటీసు</h3>
          <h3 className="text-center font-bold mb-4">భూ నిజ నిర్దారణ కొరకు</h3>
          <p className="text-left">
            1) సర్వే సహాయక సంచాలకులు Assistant Director వారి నోటిఫికేషన్ నెం. 6(i), అనుసరించి, {districtName || '____________________'} జిల్లా,
            {mandalName || '_____________________'} మండలం, {villageName || '____________________'} గ్రామములో సీమానిర్ణయం (demarcation) మరియు సర్వే పనులు
            {startDate ? formatDate(startDate) : '_____________'} తేదీన {startTime ? formatTime(startTime) : '________'} గం.ని.లకు ప్రారంభిచబడును అని తెలియజేయడమైనది.<br />
            2) సర్వే మరియు సరిహద్దుల చట్టం, 1923లోని నియమ నిబంధనలు అనుసరించి సర్వే సమయం నందు ఈ క్రింది షెడ్యూల్ లోని భూ
            యజమానులు భూమి వద్ద హాజరై మీ పొలము యొక్క సరిహద్దులను చూపించి, తగిన సమాచారం మరియు అవసరమైన సహాయ సహకారములు
            అందించవలసినదిగా తెలియజేయడమైనది.
          </p>
        </div>
        
        <div className="p-4 print:p-0! print:bg-transparent" ref={printRef}>
          <PrintableNotice
            districtName={districtName}
            mandalName={mandalName}
            villageName={villageName}
            startDate={startDate}
            startTime={startTime}
            notices={notices}
            showHeaderOnWeb={false}
          />
        </div>
      </Card>
    </motion.div>
  );
};

const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));
    return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  } catch (error) {
    return timeString;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  } catch (error) {
    return dateString;
  }
};

export default PreviewSection;
