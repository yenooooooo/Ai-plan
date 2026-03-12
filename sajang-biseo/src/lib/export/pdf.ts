"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * HTML 요소를 PDF로 저장
 * @param element 캡처할 DOM 요소
 * @param filename 파일명 (.pdf 확장자 제외)
 */
export async function saveAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  // toBlob → URL.createObjectURL로 메모리 효율적 처리
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png")
  );
  if (!blob) throw new Error("이미지 생성 실패");

  const imgUrl = URL.createObjectURL(blob);

  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // 여러 페이지 처리
  let heightLeft = imgHeight;
  let position = 0;
  const pageHeight = 297; // A4 height

  pdf.addImage(imgUrl, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgUrl, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
  URL.revokeObjectURL(imgUrl);
}
