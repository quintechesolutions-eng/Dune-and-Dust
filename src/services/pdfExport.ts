import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SavedItinerary } from '../types';

export const exportToPDF = (trip: SavedItinerary) => {
  const doc = new jsPDF() as any;
  const baseCurrency = (trip as any).baseCurrency || trip.config?.baseCurrency || 'USD';
  const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NAD: 'N$' };
  const symbol = currencySymbols[baseCurrency] || `${baseCurrency} `;

  // Colors
  const primaryColor = [59, 130, 246]; // Blue-500
  const secondaryColor = [30, 41, 59]; // Stone-900
  const accentColor = [245, 158, 11]; // Amber-500

  // Title Section
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(trip.title.toUpperCase(), 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Curated by ${trip.userName} | Expedition App`, 15, 30);

  let yPos = 50;

  // Overview
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TRIP OVERVIEW', 15, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const overviewLines = doc.splitTextToSize(trip.overview, 180);
  doc.text(overviewLines, 15, yPos);
  yPos += (overviewLines.length * 5) + 10;

  // Stats
  doc.setDrawColor(230, 230, 230);
  doc.line(15, yPos, 195, yPos);
  yPos += 10;

  const totalBudget = trip.data.logistics.estimatedBudgetTotal || (trip.data.logistics as any).estimatedBudgetTotalUSD || 0;

  const stats = [
    { label: 'DAYS', val: `${trip.data.dailyPlan.length}` },
    { label: 'DISTANCE', val: `~${trip.data.tripSummary.totalEstimatedDistanceKm} km` },
    { label: 'BUDGET', val: `${symbol}${totalBudget.toLocaleString()}` },
    { label: 'PACE', val: trip.config?.logistics?.pace || 'Standard' }
  ];

  let xPos = 15;
  stats.forEach(stat => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(stat.label, xPos, yPos);
    doc.setFontSize(11);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.val, xPos, yPos + 6);
    xPos += 45;
  });
  yPos += 20;

  // Itinerary Table
  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY ITINERARY', 15, yPos);
  yPos += 5;

  const itineraryRows = trip.data.dailyPlan.map(day => [
    `Day ${day.day}`,
    `${day.location}\n\n${day.description.substring(0, 150)}...`,
    `${day.activities.join('\n• ')}`,
    `${day.accommodation.name}\n(${day.accommodation.type})`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Day', 'Destination & Summary', 'Activities', 'Accommodation']],
    body: itineraryRows,
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 }
    }
  });

  // Next Page for Logistics
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('LOGISTICS & GEAR', 15, yPos);
  yPos += 10;

  // Packing List
  doc.setFontSize(11);
  doc.text('Recommended Gear:', 15, yPos);
  yPos += 7;
  
  const packingRows = [];
  for (let i = 0; i < trip.data.logistics.packingList.length; i += 2) {
    packingRows.push([
      `• ${trip.data.logistics.packingList[i]}`,
      trip.data.logistics.packingList[i + 1] ? `• ${trip.data.logistics.packingList[i + 1]}` : ''
    ]);
  }

  autoTable(doc, {
    startY: yPos,
    body: packingRows,
    styles: { fontSize: 9, cellPadding: 3 },
    theme: 'plain',
    margin: { left: 15 }
  });

  yPos = ((doc as any).lastAutoTable?.finalY || yPos) + 15;

  // Budget Allocation
  if (trip.data.logistics.budgetAllocation) {
    doc.setFontSize(11);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Budget Allocation:', 15, yPos);
    yPos += 7;

    const budgetData = [
      ['Accommodation', `${symbol}${trip.data.logistics.budgetAllocation.accommodation.toLocaleString()}`],
      ['Transportation', `${symbol}${trip.data.logistics.budgetAllocation.transportation.toLocaleString()}`],
      ['Food & Dining', `${symbol}${trip.data.logistics.budgetAllocation.food.toLocaleString()}`],
      ['Activities', `${symbol}${trip.data.logistics.budgetAllocation.activities.toLocaleString()}`],
      ['TOTAL ESTIMATED', `${symbol}${totalBudget.toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: yPos,
      body: budgetData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'right' }
      },
      margin: { left: 15, right: 100 }
    });
  }

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated by Dune & Dust Expedition Planner | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save(`${trip.title.replace(/\s+/g, '_')}_Itinerary.pdf`);
};
