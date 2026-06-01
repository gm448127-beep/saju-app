/** 리포트 영역 PNG/PDF 내보내기 — ShareButton·PdfButton·툴바 메뉴 공통 */

export async function exportReportAsPng(
  target: HTMLElement,
  fileName: string,
): Promise<void> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(target, {
    backgroundColor: "#F5F0E8",
    pixelRatio: 2,
    cacheBust: true,
    style: { padding: "20px" },
  });
  const link = document.createElement("a");
  link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = dataUrl;
  link.click();
}

export async function shareReportImage(
  target: HTMLElement,
  fileName: string,
): Promise<boolean> {
  const { toBlob } = await import("html-to-image");
  const blob = await toBlob(target, {
    backgroundColor: "#F5F0E8",
    pixelRatio: 2,
    cacheBust: true,
  });

  if (blob && navigator.share && navigator.canShare) {
    const file = new File([blob], `${fileName}.png`, { type: "image/png" });
    const shareData = { title: "운명비서 결과", text: "나의 분석 결과", files: [file] };
    if (navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    }
  }
  return false;
}

export async function exportReportAsPdf(
  target: HTMLElement,
  fileName: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(target, {
    backgroundColor: "#F5F0E8",
    scale: 2,
    useCORS: true,
    ignoreElements: (element) => element.hasAttribute("data-pdf-ignore"),
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF("p", "mm", "a4");
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
    pdf.addImage(imgData, "JPEG", margin, margin - renderedHeight, imgWidth, imgHeight);
    renderedHeight += contentHeight;
    pageIndex += 1;
  }

  pdf.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
