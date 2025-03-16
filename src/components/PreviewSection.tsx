
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import PrintableNotice from './PrintableNotice';
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

  const handleDownloadWord = async () => {
    try {
      // Create a new HTML document for Word conversion
      const wordContent = document.createElement('div');
      
      // Add styles for Word document with Gautami font
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Gautami';
          src: url('fonts/gautami.ttf') format('truetype');
        }
        body { 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif; 
          margin: 0;
          padding: 0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif;
        }
        th, td { 
          border: 1px solid black; 
          padding: 6px; 
          text-align: center; 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif;
        }
        .header { 
          text-align: center; 
          font-weight: bold; 
          margin-bottom: 10px; 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif;
          padding-top: 0;
          margin-top: 0;
        }
        .content { 
          text-align: left; 
          margin-bottom: 15px; 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif;
        }
        .footer { 
          margin-top: 15px; 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif;
        }
        .left-footer { 
          float: left; 
          text-align: left; 
        }
        .right-footer { 
          float: right; 
          text-align: right; 
        }
        .notice-section {
          page-break-after: always;
          padding: 0 15mm 20mm 15mm;
          margin-top: 0;
        }
        .notice-section:last-child {
          page-break-after: avoid;
        }
        .blank-page {
          height: 100vh;
          page-break-after: always;
        }
        @page {
          margin-top: 0;
          margin-bottom: 0;
        }
      `;
      wordContent.appendChild(style);
      
      // Process each notice
      notices.forEach((notice, index) => {
        const noticeDiv = document.createElement('div');
        noticeDiv.className = 'notice-section telugu-text';
        
        // Add header at the very top of the page
        const header = document.createElement('div');
        header.className = 'header telugu-text';
        header.style.marginTop = '0';
        header.style.paddingTop = '0';
        header.innerHTML = `
          <h1 style="font-size: 14pt; margin-top: 0;">ఫారం-19</h1>
          <h1 style="font-size: 14pt;">భూ యాజమాన్య దారులకు నోటీసు</h1>
          <h1 style="font-size: 14pt; margin-bottom: 15px;">భూ నిజ నిర్దారణ కొరకు</h1>
        `;
        noticeDiv.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'content telugu-text';
        content.innerHTML = `
          <p style="font-size: 12pt; line-height: 1.5;">1) సర్వే సహాయక సంచాలకులు Assistant Director వారి నోటిఫికేషన్ నెం. 6(i), అనుసరించి, ${districtName || '____________________'} జిల్లా, 
          ${mandalName || '_____________________'} మండలం, ${villageName || '____________________'} గ్రామములో సీమానిర్ణయం (demarcation) మరియు సర్వే పనులు
          ${formatDate(startDate) || '_____________'} తేదీన ${formatTime(startTime) || '________'} గం.ని.లకు ప్రారంభిచబడును అని తెలియజేయడమైనది.</p>
          <p style="font-size: 12pt; line-height: 1.5;">2) సర్వే మరియు సరిహద్దుల చట్టం, 1923లోని నియమ నిబంధనలు అనుసరించి సర్వే సమయం నందు ఈ క్రింది షెడ్యూల్ లోని భూ
          యజమానులు భూమి వద్ద హాజరై మీ పొలము యొక్క సరిహద్దులను చూపించి, తగిన సమాచారం మరియు అవసరమైన సహాయ సహకారములు
          అందించవలసినదిగా తెలియజేయడమైనది.</p>
        `;
        noticeDiv.appendChild(content);
        
        // Create table
        const table = document.createElement('table');
        
        // Add table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        notice.fields.forEach(field => {
          const th = document.createElement('th');
          th.textContent = field.te;
          th.style.fontWeight = 'bold';
          headerRow.appendChild(th);
        });
        
        const signatureTh = document.createElement('th');
        signatureTh.textContent = 'సంతకం';
        signatureTh.style.fontWeight = 'bold';
        headerRow.appendChild(signatureTh);
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Add table body
        const tbody = document.createElement('tbody');
        
        notice.rows.forEach(row => {
          const tr = document.createElement('tr');
          
          notice.fields.forEach(field => {
            const td = document.createElement('td');
            td.textContent = row[notice.mapping[field.en]] || '';
            tr.appendChild(td);
          });
          
          const signatureTd = document.createElement('td');
          signatureTd.innerHTML = '&nbsp;';
          tr.appendChild(signatureTd);
          
          tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        noticeDiv.appendChild(table);
        
        // Add footer
        const footer = document.createElement('div');
        footer.className = 'footer telugu-text';
        footer.style.marginTop = '30px';
        footer.innerHTML = `
          <div class="left-footer">
            <p>స్తలం: ${villageName || '_____________'}</p>
            <p>తేది: _____________</p>
          </div>
          <div class="right-footer">
            <p>గ్రామ సర్వేయర్ సంతకం</p>
          </div>
          <div style="clear: both;"></div>
        `;
        noticeDiv.appendChild(footer);
        
        wordContent.appendChild(noticeDiv);
      });
      
      // Convert to Blob - use HTML format for better rendering in Word
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Land Notices</title>
        </head>
        <body>
          ${wordContent.innerHTML}
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `land-notices-${villageName || 'village'}.doc`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Word Document Downloaded Successfully",
        description: "Land notices have been saved to your device.",
      });
    } catch (error) {
      console.error('Error generating Word document:', error);
      toast({
        title: "Word Document Generation Failed",
        description: "There was an error creating the document. Please try again.",
        variant: "destructive",
      });
    };
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
            onClick={handleDownloadWord}
            className="flex items-center gap-2"
            variant="secondary"
          >
            <Download className="h-4 w-4" />
            Download Word Doc
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
