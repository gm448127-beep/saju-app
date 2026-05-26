'use client';

import { useState } from 'react';

interface ShareButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  fileName?: string;
}

export default function ShareButton({ targetRef, fileName = 'saju-result' }: ShareButtonProps) {
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = async () => {
    if (!targetRef.current || saving) return;
    setSaving(true);

    try {
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: '#F5F0EB',
        pixelRatio: 2,
        cacheBust: true,
        style: {
          padding: '20px',
        },
      });

      const link = document.createElement('a');
      link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('?��?지 ?�???�패:', error);
      // ?��?방법: ?�립보드???�스??복사
      try {
        const text = targetRef.current?.innerText || '';
        await navigator.clipboard.writeText(text);
        alert('?��?지 ?�?�이 ?�려???�스?�로 복사?�습?�다.');
      } catch {
        alert('?��?지 ?�?�에 ?�패?�어?? ?�크린샷???�용?�주?�요!');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!targetRef.current || saving) return;
    setSaving(true);

    try {
      const { toBlob } = await import('html-to-image');

      const blob = await toBlob(targetRef.current, {
        backgroundColor: '#F5F0EB',
        pixelRatio: 2,
        cacheBust: true,
      });

      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
        const shareData = { title: '?�명비서 결과', text: '?�의 분석 결과', files: [file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setSaving(false);
          return;
        }
      }

      // 공유 미�??????�운로드
      await handleSave();
    } catch (error) {
      console.error('공유 ?�패:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-1 gap-1 justify-center my-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center whitespace-nowrap px-2 py-2 rounded-xl border border-[#D9C8C0] bg-white text-[#3D3338] text-xs transition-all active:scale-95 disabled:opacity-50 hover:border-[#8B6F47] sm:px-4 sm:py-2.5 sm:text-sm"
          style={{ fontFamily: 'Jua, sans-serif' }}
        >
          {saving ? '?�??�?..' : '?��?지 ?�??}
        </button>
        <button
          onClick={handleShare}
          disabled={saving}
          className="flex flex-1 items-center justify-center whitespace-nowrap px-2 py-2 rounded-xl bg-[#7B7355] text-white text-xs transition-all active:scale-95 disabled:opacity-50 hover:bg-[#6A6349] sm:px-4 sm:py-2.5 sm:text-sm"
          style={{ fontFamily: 'Jua, sans-serif' }}
        >
          {saving ? '준�?�?..' : '공유?�기'}
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#3D3338] text-white px-6 py-3 rounded-2xl text-sm z-50 animate-fade-in"
          style={{ fontFamily: 'Jua, sans-serif' }}>
          ?��?지가 ?�?�되?�습?�다.
        </div>
      )}
    </>
  );
}
