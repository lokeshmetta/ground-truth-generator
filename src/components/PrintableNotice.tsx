
import React from 'react';

interface NoticeData {
  khataNo: string;
  rows: string[][];
  mapping: Record<string, number>;
  fields: { en: string; te: string }[];
}

interface PrintableNoticeProps {
  districtName: string;
  mandalName: string;
  villageName: string;
  startDate: string;
  startTime: string;
  notices: NoticeData[];
}

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
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (error) {
    return dateString;
  }
};

const PrintableNotice: React.FC<PrintableNoticeProps> = ({
  districtName,
  mandalName,
  villageName,
  startDate,
  startTime,
  notices
}) => {
  const formattedTime = formatTime(startTime);
  const formattedDate = formatDate(startDate);

  return (
    <div>
      {notices.map((notice, noticeIndex) => (
        <div key={`notice-${noticeIndex}`} className="khata-group">
          <div className="telugu-header-print telugu-text">
            <h3>ఫారం-19</h3>
            <h3>భూ యాజమాన్య దారులకు నోటీసు</h3>
            <h3>భూ నిజ నిర్దారణ కొరకు</h3>
            <p>
              1) సర్వే సహాయక సంచాలకులు Assistant Director వారి నోటిఫికేషన్ నెం. 6(i), అనుసరించి, {districtName || '____________________'} జిల్లా,
              {mandalName || '_____________________'} మండలం, {villageName || '____________________'} గ్రామములో సీమానిర్ణయం (demarcation) మరియు సర్వే పనులు
              {formattedDate || '_____________'} తేదీన {formattedTime || '________'} గం.ని.లకు ప్రారంభిచబడును అని తెలియజేయడమైనది.<br />
              2) సర్వే మరియు సరిహద్దుల చట్టం, 1923లోని నియమ నిబంధనలు అనుసరించి సర్వే సమయం నందు ఈ క్రింది షెడ్యూల్ లోని భూ
              యజమానులు భూమి వద్ద హాజరై మీ పొలము యొక్క సరిహద్దులను చూపించి, తగిన సమాచారం మరియు అవసరమైన సహాయ సహకారములు
              అందించవలసినదిగా తెలియజేయడమైనది.
            </p>
          </div>

          <table className="khata-table print-table border-collapse border border-gray-400">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col />
              <col className="signature-column" />
            </colgroup>
            <thead>
              <tr>
                {notice.fields.map((field, i) => (
                  <th key={`header-${i}`} className="telugu-text border border-gray-400 text-center font-bold p-2">
                    {field.te}
                  </th>
                ))}
                <th className="signature-column telugu-text border border-gray-400 text-center font-bold p-2">సంతకం</th>
              </tr>
            </thead>
            <tbody>
              {notice.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {notice.fields.map((field, colIndex) => (
                    <td key={`cell-${rowIndex}-${colIndex}`} className="border border-gray-400 p-2">
                      {row[notice.mapping[field.en]] || ''}
                    </td>
                  ))}
                  <td className="signature-column border border-gray-400 p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="page-footer">
            <div className="footer-row">
              <div className="left-column">
                <p className="body-footer-text telugu-text">స్తలం: {villageName || '_____________'}</p>
                <p className="body-footer-text telugu-text">తేది: {formattedDate || '_____________'}</p>
              </div>
              <div className="right-column">
                <p className="body-footer-text telugu-text">గ్రామ సర్వేయర్ సంతకం</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrintableNotice;
