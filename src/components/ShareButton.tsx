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
      console.error('이미지 저장 실패:', error);
      // 대체 방법: 클립보드에 텍스트 복사
      try {
        const text = targetRef.current?.innerText || '';
        await navigator.clipboard.writeText(text);
        alert('이미지 저장이 어려워 텍스트로 복사했어요! 📋');
      } catch {
        alert('이미지 저장에 실패했어요. 스크린샷을 이용해주세요!');
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
        const shareData = { title: '사주도우미 결과', text: '나의 사주 분석 결과! 🔮', files: [file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setSaving(false);
          return;
        }
      }

      // 공유 미지원 시 다운로드
      await handleSave();
    } catch (error) {
      console.error('공유 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 justify-center my-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-base transition-all active:scale-95 disabled:opacity-50"
          style={{ fontFamily: 'Jua, sans-serif', backgroundColor: '#8B7EC8' }}
        >
          {saving ? '저장 중...' : '📸 이미지 저장'}
        </button>
        <button
          onClick={handleShare}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-base transition-all active:scale-95 disabled:opacity-50"
          style={{ fontFamily: 'Jua, sans-serif', backgroundColor: '#E88B9C' }}
        >
          {saving ? '준비 중...' : '📤 공유하기'}
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#3D3338] text-white px-6 py-3 rounded-2xl text-sm z-50 animate-fade-in"
          style={{ fontFamily: 'Jua, sans-serif' }}>
          ✅ 이미지가 저장되었어요!
        </div>
      )}
    </>
  );
}
