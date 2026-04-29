import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SavedItinerary } from '../types';

export const exportToPDF = (trip: SavedItinerary) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  }) as any;

  const baseCurrency = (trip as any).baseCurrency || trip.config?.baseCurrency || 'USD';
  const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NAD: 'N$' };
  const symbol = currencySymbols[baseCurrency] || `${baseCurrency} `;

  // Premium Color Palette (Namibian Desert Inspired)
  const colors: Record<string, [number, number, number]> = {
    primary: [180, 83, 9],    // Deep Ochre / Burnt Orange
    secondary: [28, 25, 23],  // Stone 900 / Charcoal
    accent: [217, 119, 6],    // Amber 600 / Sunset Gold
    muted: [120, 113, 108],   // Stone 500
    bg: [248, 250, 252],      // Slate 50
    light: [242, 242, 242],   // Light Grey
    white: [255, 255, 255]
  };

  // Helper for adding section headers
  const addSectionHeader = (text: string, y: number) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.secondary);
    doc.text(text.toUpperCase(), 15, y);

    // Aesthetic underline
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.8);
    doc.line(15, y + 2, 35, y + 2);

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(35, y + 2, 195, y + 2);

    return y + 12;
  };

  // --- COVER PAGE ---
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 0, 210, 297, 'F');

  if ((doc as any).GState) {
    doc.setFillColor(...colors.primary);
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
    doc.circle(210, 0, 100, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
  } else {
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.circle(210, 0, 100, 'F');
  }

  doc.setTextColor(...colors.white);
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(trip.title.toUpperCase(), 160);
  doc.text(titleLines, 20, 100);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.accent);
  doc.text('NAMIBIAN EXPEDITION ITINERARY', 20, 90);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(12);
  doc.text(`A journey curated for ${trip.userName}`, 20, 110 + (titleLines.length * 15));

  doc.setFontSize(10);
  doc.setTextColor(...colors.white);
  doc.text('DUNE & DUST', 105, 270, { align: 'center' });
  doc.setDrawColor(...colors.primary);
  doc.line(95, 272, 115, 272);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('PREMIUM TRAVEL PLANNER', 105, 277, { align: 'center' });

  // --- PAGE 2: OVERVIEW ---
  doc.addPage();
  let yPos = 25;

  doc.setFillColor(...colors.bg);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Expedition Overview', 15, 25);

  yPos = 55;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const overviewLines = doc.splitTextToSize(trip.overview, 180);
  doc.text(overviewLines, 15, yPos, { lineHeightFactor: 1.5 });
  yPos += (overviewLines.length * 7) + 15;

  // Key Stats Cards
  const totalBudget = trip.data.logistics.estimatedBudgetTotal || (trip.data.logistics as any).estimatedBudgetTotalUSD || 0;
  const stats = [
    { label: 'DURATION', val: `${trip.data.dailyPlan.length} Days` },
    { label: 'DISTANCE', val: `${trip.data.tripSummary.totalEstimatedDistanceKm} km` },
    { label: 'BUDGET', val: `${symbol}${totalBudget.toLocaleString()}` },
    { label: 'PACE', val: trip.config?.logistics?.pace || 'Balanced' },
    { label: 'START', val: trip.config?.logistics?.startingLocation || 'Windhoek' }
  ];

  let xPos = 15;
  stats.forEach(stat => {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(xPos, yPos, 42, 25, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.label, xPos + 5, yPos + 8);
    doc.setFontSize(12);
    doc.setTextColor(...colors.secondary);
    doc.text(stat.val, xPos + 5, yPos + 18);
    xPos += 47;
  });
  yPos += 35;

  // Climate & Wildlife (NEW)
  if (trip.data.tripSummary.climateExpectancy || trip.data.tripSummary.wildlifeExpectancy) {
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, yPos, 180, 25, 4, 4, 'F');
    doc.setDrawColor(240, 240, 240);
    doc.rect(15, yPos, 180, 25, 'S');

    if (trip.data.tripSummary.climateExpectancy) {
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text('CLIMATE:', 20, yPos + 8);
      doc.setFontSize(9);
      doc.setTextColor(...colors.secondary);
      doc.text(doc.splitTextToSize(trip.data.tripSummary.climateExpectancy, 75), 20, yPos + 13);
    }

    if (trip.data.tripSummary.wildlifeExpectancy) {
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text('WILDLIFE:', 105, yPos + 8);
      doc.setFontSize(9);
      doc.setTextColor(...colors.secondary);
      doc.text(doc.splitTextToSize(trip.data.tripSummary.wildlifeExpectancy, 75), 105, yPos + 13);
    }
    yPos += 35;
  } else {
    yPos += 10;
  }

  // --- EXPEDITION MAP (2D) ---
  yPos = addSectionHeader('Expedition Map', yPos);
  
  // Drawing a simplified 2D map path
  const mapWidth = 180;
  const mapHeight = 80;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, yPos, mapWidth, mapHeight, 3, 3, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(15, yPos, mapWidth, mapHeight, 'S');

  // Simple coordinate mapping
  const points = trip.data.dailyPlan.filter(d => d.latitude && d.longitude);
  if (points.length > 1) {
    const lats = points.map(p => p.latitude!);
    const lons = points.map(p => p.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const mapScale = (v: number, min: number, max: number, size: number) => {
      if (max === min) return size / 2;
      return ((v - min) / (max - min)) * size;
    };

    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(1);
    
    points.forEach((p, i) => {
      const x = 15 + 10 + mapScale(p.longitude!, minLon, maxLon, mapWidth - 20);
      const y = yPos + mapHeight - 10 - mapScale(p.latitude!, minLat, maxLat, mapHeight - 20);
      
      if (i > 0) {
        const prevP = points[i-1];
        const prevX = 15 + 10 + mapScale(prevP.longitude!, minLon, maxLon, mapWidth - 20);
        const prevY = yPos + mapHeight - 10 - mapScale(prevP.latitude!, minLat, maxLat, mapHeight - 20);
        
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.8);
        doc.line(prevX, prevY, x, y);
      }
      
      // Stop marker (Circle with Day Number)
      doc.setFillColor(...colors.secondary);
      doc.circle(x, y, 2.8, 'F');
      doc.setFontSize(5);
      doc.setTextColor(255, 255, 255);
      doc.text(String(p.day), x, y + 1.5, { align: 'center' });
      
      // Location Label
      doc.setFontSize(5);
      doc.setTextColor(...colors.muted);
      doc.text(p.location, x + 4, y + 1);
    });

    doc.setFontSize(7);
    doc.setTextColor(...colors.muted);
    doc.text('Schematic 2D Projection of Route', 105, yPos + mapHeight - 4, { align: 'center' });
  }
  yPos += mapHeight + 15;

  // --- THE JOURNEY (DETAILED DAY CARDS) ---
  yPos = addSectionHeader('Detailed Itinerary', yPos);

  trip.data.dailyPlan.forEach((day, index) => {
    // Check for page break (estimated height needed for a day card: ~70mm)
    if (yPos > 220) {
      doc.addPage();
      yPos = 25;
    }

    // Day Marker
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(15, yPos, 180, 10, 2, 2, 'F');
    doc.setTextColor(...colors.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`DAY ${day.day}: ${day.location.toUpperCase()}`, 20, yPos + 6.5);
    yPos += 16;

    // Narrative Description (THE "WAYY BETTER" TEXT)
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    const dayDescLines = doc.splitTextToSize(day.description, 170);
    doc.text(dayDescLines, 20, yPos, { lineHeightFactor: 1.4 });
    yPos += (dayDescLines.length * 5.5) + 8;

    // Small info row (Drive Time & Accommodation)
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'bold');
    doc.text('LOGISTICS:', 20, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.secondary);
    const driveInfo = day.driveTimeHours ? ` • ${day.driveTimeHours} drive` : '';
    const roadInfo = day.roadConditions ? ` • Road: ${day.roadConditions}` : '';
    doc.text(`Stay: ${day.accommodation.name}${driveInfo}${roadInfo}`, 48, yPos);
    yPos += 6;

    // Activities (Bulleted)
    if (day.activities.length > 0) {
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.muted);
      doc.setFont('helvetica', 'bold');
      doc.text('PLANNED:', 20, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const activitiesText = day.activities.join('  •  ');
      const actLines = doc.splitTextToSize(activitiesText, 140);
      doc.text(actLines, 48, yPos);
      yPos += (actLines.length * 4.5) + 12;
    } else {
      yPos += 8;
    }

    // Decorative Separator
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.1);
    doc.line(20, yPos - 4, 190, yPos - 4);
  });

  // --- PAGE: LOGISTICS & GEAR ---
  doc.addPage();
  yPos = 25;
  yPos = addSectionHeader('Logistics & Gear', yPos);

  // Packing List
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Packing List', 15, yPos);
  yPos += 8;

  const packingRows = [];
  for (let i = 0; i < trip.data.logistics.packingList.length; i += 3) {
    packingRows.push([
      `• ${trip.data.logistics.packingList[i] || ''}`,
      trip.data.logistics.packingList[i + 1] ? `• ${trip.data.logistics.packingList[i + 1]}` : '',
      trip.data.logistics.packingList[i + 2] ? `• ${trip.data.logistics.packingList[i + 2]}` : ''
    ]);
  }

  autoTable(doc, {
    startY: yPos,
    body: packingRows,
    styles: { fontSize: 9, cellPadding: 3, textColor: [80, 80, 80] },
    theme: 'plain',
    margin: { left: 15 }
  });

  yPos = ((doc as any).lastAutoTable?.finalY || yPos) + 20;

  // Budget Breakdown
  if (trip.data.logistics.budgetAllocation) {
    yPos = addSectionHeader('Financial Estimates', yPos);

    const budgetData: any[][] = [
      ['Accommodation', `${symbol}${trip.data.logistics.budgetAllocation.accommodation.toLocaleString()}`],
      ['Transportation & Fuel', `${symbol}${trip.data.logistics.budgetAllocation.transportation.toLocaleString()}`],
      ['Food & Dining', `${symbol}${trip.data.logistics.budgetAllocation.food.toLocaleString()}`],
      ['Activities & Fees', `${symbol}${trip.data.logistics.budgetAllocation.activities.toLocaleString()}`],
      [
        { content: 'TOTAL ESTIMATED', styles: { fontStyle: 'bold', fillColor: colors.secondary, textColor: colors.white } },
        { content: `${symbol}${totalBudget.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: colors.secondary, textColor: colors.white, halign: 'right' } }
      ]
    ];

    autoTable(doc, {
      startY: yPos,
      body: budgetData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'right', cellWidth: 40 }
      },
      margin: { left: 15 }
    });
  }

  // --- FOOTERS ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Page ${i} of ${pageCount}`, 195, 287, { align: 'right' });

    if (i > 1) {
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text('DUNE & DUST | PREPARED FOR ' + trip.userName.toUpperCase(), 15, 287);
      doc.setDrawColor(230, 230, 230);
      doc.line(15, 283, 195, 283);
    }
  }

  doc.save(`${trip.title.replace(/\s+/g, '_')}_Itinerary.pdf`);
};
