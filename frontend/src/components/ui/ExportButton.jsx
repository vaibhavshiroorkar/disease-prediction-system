import { Download, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';

/**
 * Button that exports a given element to PDF using html2canvas + jsPDF.
 * Pass a ref to the DOM element you want to capture.
 */
export default function ExportButton({ targetRef, filename = 'medipredict-results', label = 'Export PDF' }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!targetRef?.current) return;

    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [targetRef, filename]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="btn-secondary inline-flex items-center gap-2 text-sm !px-4 !py-2"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" /> {label}
        </>
      )}
    </button>
  );
}
