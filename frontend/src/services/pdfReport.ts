import jsPDF from 'jspdf';
import { format, intervalToDuration, formatDuration } from 'date-fns';
import type { SessionData } from '@/store/useSessionStore';

interface ReportOptions {
  session: SessionData;
  confidenceChartBase64?: string;
}

function formatMs(ms: number): string {
  const dur = intervalToDuration({ start: 0, end: ms });
  return formatDuration(dur, { format: ['hours', 'minutes', 'seconds'] }) || '0 seconds';
}

function getTopInferences(counts: Record<string, number>, limit = 5): Array<{ decision: string; count: number }> {
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([decision, count]) => ({ decision, count }));
}

export async function generateSessionPDF({ session, confidenceChartBase64 }: ReportOptions): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryColor: [number, number, number] = [0, 200, 200]; // Cyan
  const textColor: [number, number, number] = [40, 40, 50];
  const mutedColor: [number, number, number] = [120, 120, 130];
  const successColor: [number, number, number] = [34, 197, 94];
  const warningColor: [number, number, number] = [234, 179, 8];
  const dangerColor: [number, number, number] = [239, 68, 68];

  // Helper functions
  const addTitle = (text: string, size = 24) => {
    pdf.setFontSize(size);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(text, margin, y);
    y += size * 0.5;
  };

  const addSubtitle = (text: string, size = 14) => {
    pdf.setFontSize(size);
    pdf.setTextColor(...textColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(text, margin, y);
    y += size * 0.4;
  };

  const addText = (text: string, size = 10, color = textColor) => {
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    pdf.setFont('helvetica', 'normal');
    pdf.text(text, margin, y);
    y += size * 0.5;
  };

  const addLine = () => {
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const addSection = (title: string) => {
    y += 8;
    addSubtitle(title);
    y += 2;
  };

  // ========== REPORT CONTENT ==========

  // Header
  addTitle('CognitiveSense AI');
  pdf.setFontSize(12);
  pdf.setTextColor(...mutedColor);
  pdf.text('Session Report', margin, y);
  y += 8;

  addLine();

  // Session Metadata
  addSection('Session Information');
  
  const sessionStart = new Date(session.startTime);
  const sessionEnd = session.endTime ? new Date(session.endTime) : new Date();
  const duration = sessionEnd.getTime() - session.startTime;

  const metadata = [
    ['Date', format(sessionStart, 'MMMM d, yyyy')],
    ['Start Time', format(sessionStart, 'HH:mm:ss')],
    ['End Time', format(sessionEnd, 'HH:mm:ss')],
    ['Duration', formatMs(duration)],
    ['Session ID', session.id],
  ];

  metadata.forEach(([label, value]) => {
    pdf.setFontSize(10);
    pdf.setTextColor(...mutedColor);
    pdf.text(label + ':', margin, y);
    pdf.setTextColor(...textColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, margin + 35, y);
    pdf.setFont('helvetica', 'normal');
    y += 6;
  });

  // State Timeline
  addSection('System State Distribution');

  const totalTime = session.timeInNormal + session.timeInAlert + session.timeInCritical + session.timeInOffline;
  const states = [
    { label: 'Normal', time: session.timeInNormal, color: successColor },
    { label: 'Alert', time: session.timeInAlert, color: warningColor },
    { label: 'Critical', time: session.timeInCritical, color: dangerColor },
    { label: 'Offline', time: session.timeInOffline, color: mutedColor },
  ];

  // Draw state bar
  const barHeight = 8;
  const barY = y;
  let barX = margin;

  states.forEach(({ time, color }) => {
    const width = totalTime > 0 ? (time / totalTime) * contentWidth : 0;
    if (width > 0) {
      pdf.setFillColor(...color);
      pdf.rect(barX, barY, width, barHeight, 'F');
      barX += width;
    }
  });

  y += barHeight + 4;

  // State percentages
  states.forEach(({ label, time, color }) => {
    const percentage = totalTime > 0 ? ((time / totalTime) * 100).toFixed(1) : '0.0';
    const timeStr = formatMs(time);
    
    pdf.setFillColor(...color);
    pdf.rect(margin, y - 3, 3, 3, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(...textColor);
    pdf.text(`${label}: ${percentage}% (${timeStr})`, margin + 6, y);
    y += 5;
  });

  // Stress Analysis
  addSection('Stress Analysis');
  
  const stressTime = session.timeInAlert + session.timeInCritical;
  const stressPercentage = totalTime > 0 ? ((stressTime / totalTime) * 100).toFixed(1) : '0.0';
  
  // Find longest stress interval
  const stressEntries = session.stateHistory.filter(
    entry => entry.state === 'critical' || entry.state === 'alert'
  );
  const longestStress = stressEntries.length > 0
    ? Math.max(...stressEntries.map(e => e.duration || 0))
    : 0;

  const stressStats = [
    ['Time in Stress Mode', `${stressPercentage}% (${formatMs(stressTime)})`],
    ['Longest Stress Interval', formatMs(longestStress)],
    ['Stress Episodes', stressEntries.length.toString()],
  ];

  stressStats.forEach(([label, value]) => {
    pdf.setFontSize(10);
    pdf.setTextColor(...mutedColor);
    pdf.text(label + ':', margin, y);
    pdf.setTextColor(...(stressTime > totalTime * 0.3 ? dangerColor : textColor));
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, margin + 50, y);
    pdf.setFont('helvetica', 'normal');
    y += 6;
  });

  // Confidence Chart (if provided)
  if (confidenceChartBase64) {
    addSection('Confidence Over Time');
    try {
      pdf.addImage(confidenceChartBase64, 'PNG', margin, y, contentWidth, 40);
      y += 45;
    } catch (e) {
      addText('Chart could not be rendered', 9, mutedColor);
    }
  }

  // Confidence Statistics
  addSection('Confidence Statistics');
  
  const confStats = [
    ['Average Confidence', `${session.averageConfidence.toFixed(1)}%`],
    ['Minimum Confidence', `${session.minConfidence.toFixed(1)}%`],
    ['Maximum Confidence', `${session.maxConfidence.toFixed(1)}%`],
    ['Data Points', session.confidenceHistory.length.toString()],
  ];

  confStats.forEach(([label, value]) => {
    pdf.setFontSize(10);
    pdf.setTextColor(...mutedColor);
    pdf.text(label + ':', margin, y);
    pdf.setTextColor(...textColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, margin + 45, y);
    pdf.setFont('helvetica', 'normal');
    y += 6;
  });

  // Inference Summary
  addSection('Inference Summary');
  
  addText(`Total Inferences: ${session.totalInferences}`, 10, textColor);
  y += 2;

  const topInferences = getTopInferences(session.inferenceCounts);
  if (topInferences.length > 0) {
    addText('Most Frequent:', 9, mutedColor);
    topInferences.forEach(({ decision, count }, i) => {
      pdf.setFontSize(9);
      pdf.setTextColor(...textColor);
      pdf.text(`${i + 1}. ${decision} (${count}x)`, margin + 4, y);
      y += 5;
    });
  } else {
    addText('No inferences recorded', 9, mutedColor);
  }

  // Connection Events
  if (session.disconnectEvents.length > 0) {
    addSection('Connection Events');
    addText(`Disconnections: ${session.disconnectEvents.length}`, 10, warningColor);
    addText(`Reconnections: ${session.reconnectEvents.length}`, 10, successColor);
  }

  // Summary
  y += 5;
  addLine();
  y += 2;

  pdf.setFontSize(11);
  pdf.setTextColor(...textColor);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Session Summary', margin, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');

  const summaryText = generateSummary(session, totalTime, stressTime, longestStress);
  const splitSummary = pdf.splitTextToSize(summaryText, contentWidth);
  pdf.setFontSize(9);
  pdf.setTextColor(...textColor);
  pdf.text(splitSummary, margin, y);

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 10;
  pdf.setFontSize(8);
  pdf.setTextColor(...mutedColor);
  pdf.text(
    `Generated by CognitiveSense AI on ${format(new Date(), 'MMMM d, yyyy HH:mm')}`,
    margin,
    footerY
  );
  pdf.text(
    'Page 1 of 1',
    pageWidth - margin - 20,
    footerY
  );

  return pdf.output('blob');
}

function generateSummary(
  session: SessionData,
  totalTime: number,
  stressTime: number,
  longestStress: number
): string {
  const stressPercentage = totalTime > 0 ? (stressTime / totalTime) * 100 : 0;
  const avgConfidence = session.averageConfidence;
  
  let summary = `This session lasted ${formatMs(totalTime)}. `;

  if (stressPercentage < 10) {
    summary += `The system maintained excellent stability with only ${stressPercentage.toFixed(1)}% time in elevated states. `;
  } else if (stressPercentage < 30) {
    summary += `The system showed moderate stress levels (${stressPercentage.toFixed(1)}% in alert/critical states). `;
  } else {
    summary += `Significant stress was detected with ${stressPercentage.toFixed(1)}% of the session in alert or critical states. `;
  }

  if (avgConfidence >= 80) {
    summary += `Average confidence of ${avgConfidence.toFixed(1)}% indicates high system reliability. `;
  } else if (avgConfidence >= 60) {
    summary += `Average confidence of ${avgConfidence.toFixed(1)}% suggests room for optimization. `;
  } else {
    summary += `Low average confidence of ${avgConfidence.toFixed(1)}% requires attention. `;
  }

  if (session.totalInferences > 0) {
    summary += `${session.totalInferences} inferences were processed during this session. `;
  }

  if (session.disconnectEvents.length > 0) {
    summary += `Connection instability was noted with ${session.disconnectEvents.length} disconnect event(s). `;
  }

  return summary;
}

export async function downloadSessionPDF(session: SessionData, chartBase64?: string): Promise<void> {
  const blob = await generateSessionPDF({ session, confidenceChartBase64: chartBase64 });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cognitivesense-report-${format(new Date(session.startTime), 'yyyy-MM-dd-HHmm')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
