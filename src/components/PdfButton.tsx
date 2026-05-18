'use client';

import { useState } from 'react';

interface PdfButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  fileName?: string;
}

export default function PdfButton({ targetRef, fileName = 'fortune-report' }: PdfButtonProps) {
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSavePdf = async () => {
    if (!targetRef.current || saving) return;
    setSaving(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#FAF8F5',
        scale: 2,
        useCORS: true,
        ignoreElements: (element) => element.hasAttribute('data-pdf-ignore'),
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentHeight = pageHeight - margin * 2;

      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < imgHeight) {
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, margin - renderedHeight, imgWidth, imgHeight);
        renderedHeight += contentHeight;
        pageIndex += 1;
      }

      pdf.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('PDF 저장 실패:', error);
      alert('PDF 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSavePdf}
        disabled={saving}
        className="flex flex-1 items-center justify-center whitespace-nowrap px-2 py-2 rounded-xl border border-[#D9C8C0] bg-white text-[#3D3338] text-xs transition-all active:scale-95 disabled:opacity-50 hover:border-[#8B6F47] sm:px-4 sm:py-2.5 sm:text-sm"
        style={{ fontFamily: 'Jua, sans-serif' }}
      >
        {saving ? 'PDF 생성 중...' : 'PDF 저장'}
      </button>

      {showToast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#3D3338] text-white px-6 py-3 rounded-2xl text-sm z-50 animate-fade-in"
          style={{ fontFamily: 'Jua, sans-serif' }}
        >
          PDF가 저장되었습니다.
        </div>
      )}
    </>
  );
}
