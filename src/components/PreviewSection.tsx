import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import PrintableNotice from "./PrintableNotice";
import { toast } from "@/components/ui/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
      
      if (!printRef.current) {
        throw new Error("Print reference not found");
      }
      
      const pdfContainer = document.createElement("div");
      pdfContainer.className = "pdf-container";
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.width = "210mm";
      pdfContainer.style.fontFamily = "'Gautami', 'Noto Sans Telugu', sans-serif";
      
      const contentClone = printRef.current.cloneNode(true) as HTMLElement;
      
      const teluguHeaders = contentClone.querySelectorAll(".telugu-header-print");
      teluguHeaders.forEach(header => {
        if (header.classList.contains("hidden-on-web")) {
          header.classList.remove("hidden-on-web");
        }
      });
      
      pdfContainer.appendChild(contentClone);
      document.body.appendChild(pdfContainer);
      
      const noticeGroups = pdfContainer.querySelectorAll(".khata-group");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      for (let i = 0; i < noticeGroups.length; i++) {
        const singleNoticeContainer = document.createElement("div");
        singleNoticeContainer.className = "pdf-page-container";
        singleNoticeContainer.style.width = "210mm";
        singleNoticeContainer.style.padding = "10mm";
        singleNoticeContainer.style.position = "absolute";
        singleNoticeContainer.style.left = "-8888px";
        singleNoticeContainer.style.backgroundColor = "white";
        
        const noticeClone = noticeGroups[i].cloneNode(true) as HTMLElement;
        singleNoticeContainer.appendChild(noticeClone);
        document.body.appendChild(singleNoticeContainer);
        
        if (i > 0) {
          doc.addPage();
        }
        
        const canvas = await html2canvas(singleNoticeContainer, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: singleNoticeContainer.scrollWidth,
          windowHeight: singleNoticeContainer.scrollHeight,
        });
        
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const ratio = Math.min(
          pdfWidth / imgProps.width,
          pdfHeight / imgProps.height
        );
        
        const x = (pdfWidth - imgProps.width * ratio) / 2;
        const y = 0;
        
        doc.addImage(
          imgData,
          "JPEG",
          x,
          y,
          imgProps.width * ratio,
          imgProps.height * ratio
        );
        
        document.body.removeChild(singleNoticeContainer);
      }
      
      document.body.removeChild(pdfContainer);
      
      doc.save(`land-notices-${villageName || "village"}.pdf`);
      
      toast({
        title: "PDF Downloaded Successfully",
        description: "Land notices have been saved as a PDF document.",
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
