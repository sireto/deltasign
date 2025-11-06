const webToPdf = (pdfDimensions : {height : number , width : number} , scaleFactor : number ,  webX: number, webY: number, webWidth: number, webHeight: number) => {
    const pdfX = webX * scaleFactor;
    const pdfY = (pdfDimensions.height - (webY * scaleFactor)) - (webHeight * scaleFactor);
    const pdfWidth = webWidth * scaleFactor;
    const pdfHeight = webHeight * scaleFactor;
    
    return {
      x1: pdfX,
      y1: pdfY,
      x2: pdfX + pdfWidth,
      y2: pdfY + pdfHeight
    };
  };

  // PDF Points → Web Pixels  
  const pdfToWeb = (pdfDimensions : {height : number , width : number} , scaleFactor : number ,  pdfX1: number, pdfY1: number, pdfX2: number, pdfY2: number) => {
    const webX = pdfX1 / scaleFactor;
    const webY = (pdfDimensions.height - pdfY2) / scaleFactor; 
    const webWidth = (pdfX2 - pdfX1) / scaleFactor;
    const webHeight = (pdfY2 - pdfY1) / scaleFactor;
    
    return {
      x: webX,
      y: webY,
      width: webWidth,
      height: webHeight
    };
  };