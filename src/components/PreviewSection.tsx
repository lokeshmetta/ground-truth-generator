
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import PrintableNotice from './PrintableNotice';
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

  const handleDownload = async () => {
    try {
      // Create PDF with text support
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add custom Telugu font if needed
      // pdf.addFont('path-to-telugu-font.ttf', 'Telugu', 'normal');
      // pdf.setFont('Telugu');
      
      const formattedDate = formatDate(startDate);
      const formattedTime = formatTime(startTime);
      
      // Generate each notice as a separate page with text
      notices.forEach((notice, pageIndex) => {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        // Add header
        pdf.setFontSize(14);
        pdf.text('ఫారం-19', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        pdf.text('భూ యాజమాన్య దారులకు నోటీసు', pdf.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
        pdf.text('భూ నిజ నిర్దారణ కొరకు', pdf.internal.pageSize.getWidth() / 2, 29, { align: 'center' });
        
        // Add notice text
        pdf.setFontSize(10);
        const noticeText1 = `1) సర్వే సహాయక సంచాలకులు Assistant Director వారి నోటిఫికేషన్ నెం. 6(i), అనుసరించి, ${districtName || '____________________'} జిల్లా, ${mandalName || '_____________________'} మండలం, ${villageName || '____________________'} గ్రామములో సీమానిర్ణయం (demarcation) మరియు సర్వే పనులు ${formattedDate || '_____________'} తేదీన ${formattedTime || '________'} గం.ని.లకు ప్రారంభిచబడును అని తెలియజేయడమైనది.`;
        const noticeText2 = `2) సర్వే మరియు సరిహద్దుల చట్టం, 1923లోని నియమ నిబంధనలు అనుసరించి సర్వే సమయం నందు ఈ క్రింది షెడ్యూల్ లోని భూ యజమానులు భూమి వద్ద హాజరై మీ పొలము యొక్క సరిహద్దులను చూపించి, తగిన సమాచారం మరియు అవసరమైన సహాయ సహకారములు అందించవలసినదిగా తెలియజేయడమైనది.`;
        
        pdf.text(noticeText1, 10, 40, {
          maxWidth: 190,
          lineHeightFactor: 1.5
        });
        
        pdf.text(noticeText2, 10, 65, {
          maxWidth: 190,
          lineHeightFactor: 1.5
        });
        
        // Create table headers
        const startY = 90;
        const lineHeight = 10;
        const colWidths = [30, 30, 45, 45, 30, 20]; // Adjust column widths as needed
        let currentY = startY;
        
        // Draw table headers
        let currentX = 10;
        notice.fields.forEach((field, colIndex) => {
          pdf.rect(currentX, currentY, colWidths[colIndex], lineHeight);
          pdf.text(field.te, currentX + colWidths[colIndex]/2, currentY + lineHeight/2, { align: 'center' });
          currentX += colWidths[colIndex];
        });
        
        // Add signature column
        pdf.rect(currentX, currentY, colWidths[5], lineHeight);
        pdf.text('సంతకం', currentX + colWidths[5]/2, currentY + lineHeight/2, { align: 'center' });
        
        // Draw table rows
        currentY += lineHeight;
        notice.rows.forEach((row, rowIndex) => {
          currentX = 10;
          notice.fields.forEach((field, colIndex) => {
            pdf.rect(currentX, currentY, colWidths[colIndex], lineHeight);
            const cellText = row[notice.mapping[field.en]] || '';
            pdf.text(cellText, currentX + colWidths[colIndex]/2, currentY + lineHeight/2, { align: 'center' });
            currentX += colWidths[colIndex];
          });
          
          // Add empty signature cell
          pdf.rect(currentX, currentY, colWidths[5], lineHeight);
          
          currentY += lineHeight;
        });
        
        // Add footer
        const footerY = pdf.internal.pageSize.getHeight() - 25;
        pdf.text(`స్తలం: ${villageName || '_____________'}`, 15, footerY);
        pdf.text(`తేది: ${'_____________'}`, 15, footerY + 10);
        pdf.text('గ్రామ సర్వేయర్ సంతకం', pdf.internal.pageSize.getWidth() - 15, footerY + 10, { align: 'right' });
      });
      
      pdf.save(`land-notices-${villageName || 'village'}.pdf`);
      
      toast({
        title: "PDF Downloaded Successfully",
        description: "Land notices have been saved to your device as text-based PDF.",
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

export default PreviewSection;
