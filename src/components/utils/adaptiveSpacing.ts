/**
 * Adaptive spacing utility for resumes
 * Dynamically adjusts spacing based on content density to optimize page usage
 */

export function analyzeContentDensity(htmlContent: string): number {
  // Create a temporary DOM element to analyze content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Count structural elements that take up space
  const sections = tempDiv.querySelectorAll('h2').length;
  const subsections = tempDiv.querySelectorAll('h3').length;
  const lists = tempDiv.querySelectorAll('ul').length;
  const listItems = tempDiv.querySelectorAll('li').length;
  const tables = tempDiv.querySelectorAll('table').length;
  const paragraphs = tempDiv.querySelectorAll('p').length;
  
  // Calculate text density (characters per structural element)
  const textContent = tempDiv.textContent || '';
  const textLength = textContent.replace(/\s+/g, ' ').trim().length;
  
  // Content density score: higher = more content per page
  const structuralElements = sections + subsections + lists + tables + paragraphs;
  const contentDensity = structuralElements > 0 ? textLength / structuralElements : 0;
  
  // Normalize to 0-1 scale where:
  // 0.2 = very sparse content (lots of whitespace)
  // 0.5 = normal density
  // 0.8+ = very dense content (needs compression)
  return Math.min(Math.max(contentDensity / 100, 0.1), 1.0);
}

export function enhanceHTMLWithFlexbox(htmlContent: string): string {
  // Create a temporary DOM element to manipulate
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Wrap the entire content in a flex container
  const flexContainer = document.createElement('div');
  flexContainer.className = 'resume-flex-container';
  
  // Move all children to the flex container
  while (tempDiv.firstChild) {
    flexContainer.appendChild(tempDiv.firstChild);
  }
  
  tempDiv.appendChild(flexContainer);
  
  // Group content into logical sections that can flex
  const sections = Array.from(flexContainer.querySelectorAll('h2'));
  
  sections.forEach((sectionHeader, index) => {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'resume-section-flex';
    
    // Insert wrapper before the section header
    sectionHeader.parentNode?.insertBefore(sectionWrapper, sectionHeader);
    
    // Move section header to wrapper
    sectionWrapper.appendChild(sectionHeader);
    
    // Find and move all content until the next h2 or end
    let nextElement = sectionWrapper.nextSibling;
    while (nextElement && nextElement.nodeName !== 'H2') {
      const currentElement = nextElement;
      nextElement = nextElement.nextSibling;
      if (currentElement.nodeType === Node.ELEMENT_NODE || 
          (currentElement.nodeType === Node.TEXT_NODE && currentElement.textContent?.trim())) {
        sectionWrapper.appendChild(currentElement);
      }
    }
  });
  
  return tempDiv.innerHTML;
}

export function generateAdaptiveCSS(density: number): string {
  // Calculate spacing scale factor based on density
  let spacingScale: number;
  let flexGrow: string;
  
  if (density < 0.4) {
    // Sparse content - expand spacing to fill page better
    spacingScale = 1.2 + (0.4 - density) * 0.8; // 1.2x to 2.0x
    flexGrow = '1'; // Allow sections to grow
  } else if (density < 0.7) {
    // Normal content - standard spacing
    spacingScale = 0.8 + (0.7 - density) * 1.33; // 0.8x to 1.2x  
    flexGrow = '0'; // Fixed size sections
  } else {
    // Dense content - compress spacing to fit more
    spacingScale = 0.5 + (1.0 - density) * 1.0; // 0.5x to 0.8x
    flexGrow = '0'; // Fixed size sections
  }
  
  return `
    /* Flexbox layout for adaptive spacing */
    .resume-flex-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 9.8in; /* Leave more margin at bottom for cleaner look */
    }
    
    .resume-section-flex {
      flex-grow: ${flexGrow};
      flex-shrink: 1;
      display: flex;
      flex-direction: column;
    }
    
    /* Adaptive spacing based on content density */
    body {
      line-height: ${Math.max(1.0, 1.1 * spacingScale)};
    }
    
    h1 {
      margin: ${Math.max(0.05, 0.1 * spacingScale)}in 0 ${Math.max(0.02, 0.05 * spacingScale)}in 0;
    }
    
    h2 {
      margin-top: ${Math.max(0.02, 0.04 * spacingScale)}in;
      margin-bottom: ${Math.max(0.015, 0.03 * spacingScale)}in;
    }
    
    h3 {
      margin-top: ${Math.max(0.015, 0.03 * spacingScale)}in;
      margin-bottom: ${Math.max(0.005, 0.01 * spacingScale)}in;
    }
    
    ul {
      margin-bottom: ${Math.max(0.01, 0.02 * spacingScale)}in;
      flex-grow: ${density < 0.4 ? '1' : '0'};
    }
    
    li {
      margin-bottom: ${Math.max(0.005, 0.01 * spacingScale)}in;
    }
    
    li:last-child {
      margin-bottom: 0;
    }
    
    p {
      margin: ${Math.max(0.005, 0.01 * spacingScale)}in 0;
    }
    
    table {
      margin-bottom: ${Math.max(0.005, 0.01 * spacingScale)}in;
    }
    
    /* Ensure sections can shrink when content is dense */
    ${density > 0.7 ? `
    .resume-section-flex {
      min-height: auto;
    }
    
    .resume-section-flex ul {
      margin-bottom: 0.005in;
    }
    ` : ''}
    
    /* Add some breathing room when content is sparse */
    ${density < 0.4 ? `
    .resume-section-flex:not(:last-child) {
      margin-bottom: ${0.02 * spacingScale}in;
    }
    ` : ''}
  `;
}