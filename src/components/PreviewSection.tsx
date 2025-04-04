
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import PrintableNotice from "./PrintableNotice";
import { toast } from "@/components/ui/use-toast";
import { jsPDF } from "jspdf";

interface PreviewSectionProps {
  districtName: string;
  mandalName: string;
  villageName: string;
  startDate: string;
  startTime: string;
  notificationNumber: string;
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
  notificationNumber,
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
    { en: "Survey No", te: "సర్వే నెం" },
    { en: "Khata No", te: "ఖాతా సంఖ్య" },
    { en: "Pattadar Name", te: "భూ యజమాని పేరు" },
    { en: "Relation Name", te: "భర్త/తండ్రి పేరు" },
  ];

  const optionalFields = [{ en: "Mobile Number", te: "మొబైల్ నెంబరు" }];

  const fields = [...requiredFields, ...optionalFields];

  const hasKhataNo = "Khata No" in indexMapping;

  let notices: {
    khataNo: string;
    rows: string[][];
    mapping: Record<string, number>;
    fields: { en: string; te: string }[];
  }[] = [];

  if (hasKhataNo) {
    const khataGroups: Record<string, string[][]> = {};
    data.forEach((row) => {
      const khataNo = row[indexMapping["Khata No"]] || "Unknown";
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
    notices = [
      {
        khataNo: "All Data",
        rows: data,
        mapping: indexMapping,
        fields,
      },
    ];
  }

  const formatTime = (timeString: string): string => {
    if (!timeString) return "";

    try {
      const [hours, minutes] = timeString.split(":");
      const time = new Date();
      time.setHours(parseInt(hours));
      time.setMinutes(parseInt(minutes));
      return time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date
        .toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
    } catch (error) {
      return dateString;
    }
  };

  const handleDownloadWord = async () => {
    try {
      const wordContent = document.createElement("div");

      const style = document.createElement("style");
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
        .thirdpoint { 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif; 
          font-size: 12pt; 
          line-height
          padding: 0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif;
          table-layout: fixed;
        }
        th, td { 
          border: 1px solid black; 
          padding: 6px; 
          text-align: center; 
          font-family: 'Gautami', 'Noto Sans Telugu', sans-serif;
          word-break: break-word;
          overflow-wrap: break-word;
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
          margin-top: 10px; 
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
          padding: 15mm 15mm 20mm 15mm;
          margin-top: 0;
        }
        .notice-section:last-child {
          page-break-after: avoid;
        }
        .signature-column {
          width: 120px !important;
        }
        col:last-child {
          width: 120px;
        }
        @page {
          margin: 5mm;
        }
      `;
      wordContent.appendChild(style);

      notices.forEach((notice, index) => {
        const noticeDiv = document.createElement("div");
        noticeDiv.className = "notice-section telugu-text";

        const header = document.createElement("div");
        header.className = "header telugu-text";
        header.style.marginTop = "0";
        header.style.paddingTop = "0";
        header.innerHTML = `
          <h1 style="font-size: 14pt; margin-top: 0;">ఫారం-19</h1>
          <h1 style="font-size: 14pt;">భూ యాజమాన్య దారులకు నోటీసు</h1>
          <h1 style="font-size: 14pt; margin-bottom: 15px;">భూ నిజ నిర్దారణ కొరకు</h1>
        `;
        noticeDiv.appendChild(header);

        const content = document.createElement("div");
        content.className = "content telugu-text";
        content.innerHTML = `
          <p style="font-size: 12pt; line-height: 1.5;">1) సర్వే సహాయక సంచాలకులు Assistant Director వారి నోటిఫికేషన్ RC నెం. ${
            notificationNumber || "6(i)"
          }, అనుసరించి, ${districtName || "____________________"} జిల్లా, 
          ${mandalName || "_____________________"} మండలం, ${
          villageName || "____________________"
        } గ్రామములో సీమానిర్ణయం (demarcation) మరియు సర్వే పనులు
          ${formatDate(startDate) || "_____________"} తేదీన ${
          formatTime(startTime) || "________"
        } గం.ని.లకు ప్రారంభిచబడును అని తెలియజేయడమైనది.</p>
          <p style="font-size: 12pt; line-height: 1.5;">2) సర్వే మరియు సరిహద్దుల చట్టం, 1923లోని నియమ నిబంధనలు అనుసరించి సర్వే సమయం నందు ఈ క్రింది షెడ్యూల్ లోని భూ
          యజమానులు భూమి వద్ద హాజరై మీ పొలము యొక్క సరిహద్దులను చూపించి, తగిన సమాచారం మరియు అవసరమైన సహాయ సహకారములు
          అందించవలసినదిగా తెలియజేయడమైనది.</p>
        `;
        noticeDiv.appendChild(content);

        const table = document.createElement("table");
        const colgroup = document.createElement("colgroup");

        notice.fields.forEach((field, i) => {
          const col = document.createElement("col");
          if (i === 0) col.style.width = "90px";
          else if (i === 1) col.style.width = "80px";
          else if (i === 4) col.style.width = "110px";
          else col.style.width = "auto";
          colgroup.appendChild(col);
        });

        const signatureCol = document.createElement("col");
        signatureCol.style.width = "120px";
        colgroup.appendChild(signatureCol);

        table.appendChild(colgroup);

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        notice.fields.forEach((field) => {
          const th = document.createElement("th");
          th.textContent = field.te;
          th.style.fontWeight = "bold";
          headerRow.appendChild(th);
        });

        const signatureTh = document.createElement("th");
        signatureTh.textContent = "సంతకం";
        signatureTh.style.fontWeight = "bold";
        headerRow.appendChild(signatureTh);

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        notice.rows.forEach((row) => {
          const tr = document.createElement("tr");

          notice.fields.forEach((field) => {
            const td = document.createElement("td");
            td.textContent = row[notice.mapping[field.en]] || "";
            tr.appendChild(td);
          });

          const signatureTd = document.createElement("td");
          signatureTd.innerHTML = "&nbsp;";
          tr.appendChild(signatureTd);

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        noticeDiv.appendChild(table);

        const noticeNumber = document.createElement("p");

        noticeNumber.className = "thirdpoint telugu-text";

        noticeNumber.innerHTML =
          '<p style="font-size: 12pt; font-family: Gautami, "Noto Sans Telugu", sans-serif; line-height: 1.5;">3) నోటీసు యొక్క ప్రతిని సంతకం చేసి తిరిగి పంపించవలెను</p>';
        noticeDiv.appendChild(noticeNumber);

        const footer = document.createElement("div");
        footer.className = "footer telugu-text";
        footer.style.marginTop = "10px";
        footer.innerHTML = `
          <div class="right-footer">
            <p>గ్రామ సర్వేయర్ సంతకం</p>
          </div>
          <div class="left-footer">
            <p>స్తలం: ${villageName || "_____________"}</p>
            <p>తేది: _____________</p>
          </div>
          
          <div style="clear: both;"></div>
        `;
        noticeDiv.appendChild(footer);

        wordContent.appendChild(noticeDiv);
      });

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

      const blob = new Blob([htmlContent], { type: "application/msword" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `land-notices-${villageName || "village"}.doc`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Word Document Downloaded Successfully",
        description: "Land notices have been saved to your device.",
      });
    } catch (error) {
      console.error("Error generating Word document:", error);
      toast({
        title: "Word Document Generation Failed",
        description:
          "There was an error creating the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Preparing PDF",
        description: "Please wait while we generate your PDF...",
      });

      // Load the Telugu font
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add Telugu font support
      doc.addFont("https://cdn.jsdelivr.net/npm/noto-sans-telugu-web@1.0.2/fonts/NotoSansTelugu-Regular.ttf", "NotoSansTelugu", "normal");
      doc.setFont("NotoSansTelugu");
      
      // Set text color to black
      doc.setTextColor(0, 0, 0);
      
      // Define page margins
      const margin = 15; // mm
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (2 * margin);
      let y = margin;
      
      // Process each notice
      for (let i = 0; i < notices.length; i++) {
        if (i > 0) {
          doc.addPage();
          y = margin;
        }
        
        // Add header text
        doc.setFontSize(14);
        const headerText1 = "ఫారం-19";
        const headerText2 = "భూ యాజమాన్య దారులకు నోటీసు";
        const headerText3 = "భూ నిజ నిర్దారణ కొరకు";
        
        const headerWidth1 = doc.getStringUnitWidth(headerText1) * 14 / doc.internal.scaleFactor;
        const headerWidth2 = doc.getStringUnitWidth(headerText2) * 14 / doc.internal.scaleFactor;
        const headerWidth3 = doc.getStringUnitWidth(headerText3) * 14 / doc.internal.scaleFactor;
        
        doc.text(headerText1, (pageWidth - headerWidth1) / 2, y);
        y += 8;
        doc.text(headerText2, (pageWidth - headerWidth2) / 2, y);
        y += 8;
        doc.text(headerText3, (pageWidth - headerWidth3) / 2, y);
        y += 12;
        
        // Add content text (first paragraph)
        doc.setFontSize(12);
        const paragraph1 = `1) సర్వే సహాయక సంచాలకులు Assistant Director వారి నోటిఫికేషన్ RC నెం. ${notificationNumber || "6(i)"}, అనుసరించి, ${districtName || "____________________"} జిల్లా, ${mandalName || "_____________________"} మండలం, ${villageName || "____________________"} గ్రామములో సీమానిర్ణయం (demarcation) మరియు సర్వే పనులు ${formatDate(startDate) || "_____________"} తేదీన ${formatTime(startTime) || "________"} గం.ని.లకు ప్రారంభిచబడును అని తెలియజేయడమైనది.`;
        
        // Split text into multiple lines that fit within the page width
        const splitText1 = doc.splitTextToSize(paragraph1, contentWidth);
        doc.text(splitText1, margin, y);
        y += splitText1.length * 7;
        
        // Add content text (second paragraph)
        const paragraph2 = "2) సర్వే మరియు సరిహద్దుల చట్టం, 1923లోని నియమ నిబంధనలు అనుసరించి సర్వే సమయం నందు ఈ క్రింది షెడ్యూల్ లోని భూ యజమానులు భూమి వద్ద హాజరై మీ పొలము యొక్క సరిహద్దులను చూపించి, తగిన సమాచారం మరియు అవసరమైన సహాయ సహకారములు అందించవలసినదిగా తెలియజేయడమైనది.";
        
        const splitText2 = doc.splitTextToSize(paragraph2, contentWidth);
        doc.text(splitText2, margin, y);
        y += splitText2.length * 7 + 5;
        
        // Create table
        const notice = notices[i];
        const tableCols = notice.fields.length + 1; // +1 for signature column
        const colWidth = contentWidth / tableCols;
        
        // Draw table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y, contentWidth, 10, 'F');
        doc.setDrawColor(0);
        doc.rect(margin, y, contentWidth, 10, 'S');
        
        // Vertical lines for header
        for (let c = 1; c < tableCols; c++) {
          doc.line(margin + (c * colWidth), y, margin + (c * colWidth), y + 10);
        }
        
        // Header text
        doc.setFontSize(10);
        let xPos = margin;
        for (const field of notice.fields) {
          doc.text(field.te, xPos + colWidth/2, y + 6, { align: 'center' });
          xPos += colWidth;
        }
        doc.text("సంతకం", xPos + colWidth/2, y + 6, { align: 'center' });
        
        y += 10;
        
        // Draw table body
        const rowHeight = 10;
        for (const row of notice.rows) {
          // Draw row background
          doc.setFillColor(255, 255, 255);
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
          doc.setDrawColor(0);
          doc.rect(margin, y, contentWidth, rowHeight, 'S');
          
          // Vertical lines for row
          for (let c = 1; c < tableCols; c++) {
            doc.line(margin + (c * colWidth), y, margin + (c * colWidth), y + rowHeight);
          }
          
          // Row content
          xPos = margin;
          for (const field of notice.fields) {
            const value = row[notice.mapping[field.en]] || '';
            doc.text(value, xPos + colWidth/2, y + 6, { align: 'center' });
            xPos += colWidth;
          }
          
          y += rowHeight;
          
          // Check if we need a new page for the next row
          if (y > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            y = margin;
          }
        }
        
        y += 10;
        
        // Add third point
        const paragraph3 = "3) నోటీసు యొక్క ప్రతిని సంతకం చేసి తిరిగి పంపించవలెను";
        doc.text(paragraph3, margin, y);
        y += 15;
        
        // Add footer
        doc.text(`స్తలం: ${villageName || "_____________"}`, margin, y);
        doc.text("తేది: _____________", margin, y + 7);
        doc.text("గ్రామ సర్వేయర్ సంతకం", pageWidth - margin - 40, y);
      }
      
      doc.save(`land-notices-${villageName || "village"}.pdf`);
      
      toast({
        title: "PDF Downloaded Successfully",
        description: "Land notices have been saved as a PDF document with selectable text.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
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
      className="mt-8 print:m-0 print:bg-transparent print:static preview-section overflow-hidden"
    >
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-2xl font-medium">Preview</h2>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleDownloadWord}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
            variant="secondary"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Download Word
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
            variant="secondary"
            size="sm"
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="glass-panel print:bg-transparent print:static w-full overflow-hidden">
        <div className="p-4 sm:p-6 telugu-text no-print overflow-hidden">
          <h3 className="text-center font-bold">ఫారం-19</h3>
          <h3 className="text-center font-bold">భూ యాజమాన్య దారులకు నోటీసు</h3>
          <h3 className="text-center font-bold mb-4">భూ నిజ నిర్దారణ కొరకు</h3>
          <p className="text-left">
            1) సర్వే సహాయక సంచాలకులు Assistant Director వారి నోటిఫికేషన్ RC నెం.
            {notificationNumber || "6(i)"}, అనుసరించి,{" "}
            {districtName || "____________________"} జిల్లా,
            {mandalName || "_____________________"} మండలం,{" "}
            {villageName || "____________________"} గ్రామములో సీమానిర్ణయం
            (demarcation) మరియు సర్వే పనులు
            {startDate ? formatDate(startDate) : "_____________"} తేదీన{" "}
            {startTime ? formatTime(startTime) : "________"} గం.ని.లకు
            ప్రారంభిచబడును అని తెలియజేయడమైనది.
            <br />
            2) సర్వే మరియు సరిహద్దుల చట్టం, 1923లోని నియమ నిబంధనలు అనుసరించి
            సర్వే సమయం నందు ఈ క్రింది షెడ్యూల్ లోని భూ యజమానులు భూమి వద్ద హాజరై
            మీ పొలము యొక్క సరిహద్దులను చూపించి, తగిన సమాచారం మరియు అవసరమైన సహాయ
            సహకారములు అందించవలసినదిగా తెలియజేయడమైనది.
          </p>
        </div>

        <div
          className="p-2 sm:p-4 print:p-0! print:bg-transparent w-full overflow-hidden"
          ref={printRef}
        >
          <PrintableNotice
            districtName={districtName}
            mandalName={mandalName}
            villageName={villageName}
            startDate={startDate}
            startTime={startTime}
            notificationNumber={notificationNumber}
            notices={notices}
            showHeaderOnWeb={false}
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default PreviewSection;
