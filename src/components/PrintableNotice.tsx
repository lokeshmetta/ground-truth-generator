
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
  showHeaderOnWeb?: boolean;
}

const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));
    return time.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
  } catch (error) {
    return timeString;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    // Format as dd-mm-yyyy
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
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
  notices,
  showHeaderOnWeb = true
}) => {
  const formattedTime = formatTime(startTime);
  const formattedDate = formatDate(startDate);

  return (
    <div className="ground-truth-notice w-full max-w-full overflow-hidden">
      {notices.map((notice, noticeIndex) => (
        <div key={`notice-${noticeIndex}`} className="khata-group w-full">
          {/* Telugu header - only visible in print view, hidden in web view if showHeaderOnWeb is false */}
          <div className={`telugu-header-print telugu-text ${!showHeaderOnWeb ? 'hidden-on-web' : ''}`}>
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

          <div className="table-container w-full">
            <table className="w-full border-collapse mt-4 khata-table table-fixed print-table">
              <colgroup>
                {notice.fields.map((field, i) => (
                  <col key={`col-${i}`} className={i === 0 ? 'w-[100px]' : i === 1 ? 'w-[80px]' : i === 4 ? 'w-[110px]' : ''} />
                ))}
                <col className="signature-column w-[120px]" />
              </colgroup>
              <thead>
                <tr>
                  {notice.fields.map((field, i) => (
                    <th key={`header-${i}`} className="border border-black p-2 text-center font-gautami">
                      {field.te}
                    </th>
                  ))}
                  <th className="border border-black p-2 text-center font-gautami signature-col">
                    సంతకం
                  </th>
                </tr>
              </thead>
              <tbody>
                {notice.rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {notice.fields.map((field, colIndex) => (
                      <td key={`cell-${rowIndex}-${colIndex}`} className="border border-black p-2 text-center font-gautami">
                        {row[notice.mapping[field.en]] || ''}
                      </td>
                    ))}
                    <td className="border border-black p-2 signature-col font-gautami">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="page-footer">
            <div className="footer-signature-row">
              <div className="left-column">
                <p className="body-footer-text telugu-text">స్తలం: {villageName || '_____________'}</p>
                <br /><p className="body-footer-text telugu-text">తేది: {'_____________'}</p>
              </div>
              <div className="right-column">
                <p className="body-footer-text telugu-text text-right">గ్రామ సర్వేయర్ సంతకం</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrintableNotice;
