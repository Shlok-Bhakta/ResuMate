/**
 * Measurement-based adaptive spacing system
 * Uses JavaScript measurement and binary search to optimize page utilization
 */

// Target page dimensions (US Letter: 8.5" x 11")
const PAGE_WIDTH_PX = 8.5 * 96; // 816px
const PAGE_HEIGHT_PX = 11 * 96;  // 1056px
const SAFE_HEIGHT_PX = PAGE_HEIGHT_PX - (0.265 * 96); // Leave 0.265" margin = ~1030px

export interface SpacingConfig {
  h1MarginTop: number;
  h1MarginBottom: number;
  h2MarginTop: number;
  h2MarginBottom: number;
  h3MarginTop: number;
  h3MarginBottom: number;
  ulMarginBottom: number;
  liMarginBottom: number;
  lineHeight: number;
}

// Base spacing configuration (1.0 multiplier)
export const BASE_SPACING: SpacingConfig = {
  h1MarginTop: 0.1,      // inches
  h1MarginBottom: 0.05,
  h2MarginTop: 0.04,
  h2MarginBottom: 0.03,
  h3MarginTop: 0.03,
  h3MarginBottom: 0.01,
  ulMarginBottom: 0.02,
  liMarginBottom: 0.01,
  lineHeight: 1.1,
};

/**
 * Create a CSS string from spacing config
 */
export function spacingConfigToCSS(config: SpacingConfig, multiplier: number = 1.0): string {
  const m = multiplier;
  return `
    body { line-height: ${config.lineHeight * m}; }
    h1 { 
      margin-top: ${config.h1MarginTop * m}in; 
      margin-bottom: ${config.h1MarginBottom * m}in; 
    }
    h2 { 
      margin-top: ${config.h2MarginTop * m}in; 
      margin-bottom: ${config.h2MarginBottom * m}in; 
    }
    h3 { 
      margin-top: ${config.h3MarginTop * m}in; 
      margin-bottom: ${config.h3MarginBottom * m}in; 
    }
    ul { 
      margin-bottom: ${config.ulMarginBottom * m}in; 
    }
    li { 
      margin-bottom: ${config.liMarginBottom * m}in; 
    }
  `;
}

/**
 * Create a hidden iframe for measuring content height
 */
export function createMeasurementFrame(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = `${PAGE_WIDTH_PX}px`;
  iframe.style.height = `${PAGE_HEIGHT_PX}px`;
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  
  document.body.appendChild(iframe);
  return iframe;
}

/**
 * Measure the height of content with given spacing
 */
export async function measureContentHeight(
  htmlContent: string, 
  baseCSS: string, 
  spacingMultiplier: number
): Promise<number> {
  return new Promise((resolve) => {
    const iframe = createMeasurementFrame();
    
    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          resolve(0);
          return;
        }

        const content = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                ${baseCSS}
                ${spacingConfigToCSS(BASE_SPACING, spacingMultiplier)}
                
                body, html {
                  margin: 0;
                  padding: 0;
                }
                .pdf-page {
                  width: 8.5in;
                  background-color: white;
                  padding-left: 0.2in;
                  padding-right: 0.2in;
                  padding-bottom: 0.065in;
                  box-sizing: border-box;
                  font-family: 'Times New Roman', sans-serif;
                  font-size: 10pt;
                  color: black;
                }
              </style>
            </head>
            <body>
              <div class="pdf-page">${htmlContent}</div>
            </body>
          </html>
        `;

        doc.open();
        doc.write(content);
        doc.close();

        // Wait a bit for rendering, then measure
        setTimeout(() => {
          const body = doc.body;
          const height = body ? body.scrollHeight : 0;
          
          // Clean up
          document.body.removeChild(iframe);
          resolve(height);
        }, 50);
        
      } catch (error) {
        console.error('Error measuring content height:', error);
        document.body.removeChild(iframe);
        resolve(0);
      }
    };

    // Initialize empty iframe
    iframe.src = 'about:blank';
  });
}

/**
 * Binary search to find optimal spacing multiplier
 */
export async function findOptimalSpacing(
  htmlContent: string, 
  baseCSS: string
): Promise<number> {
  let minMultiplier = 0.5;  // Minimum spacing (compressed)
  let maxMultiplier = 2.0;  // Maximum spacing (expanded)
  let bestMultiplier = 1.0; // Default fallback
  
  // First check if default spacing fits
  const defaultHeight = await measureContentHeight(htmlContent, baseCSS, 1.0);
  
  if (defaultHeight <= SAFE_HEIGHT_PX) {
    // Content fits with default spacing, try to expand
    minMultiplier = 1.0;
  } else {
    // Content overflows, need to compress
    maxMultiplier = 1.0;
  }
  
  // Binary search for optimal multiplier (max 8 iterations)
  for (let i = 0; i < 8; i++) {
    const testMultiplier = (minMultiplier + maxMultiplier) / 2;
    const height = await measureContentHeight(htmlContent, baseCSS, testMultiplier);
    
    if (height <= SAFE_HEIGHT_PX) {
      // Fits! Try larger spacing
      bestMultiplier = testMultiplier;
      minMultiplier = testMultiplier;
    } else {
      // Doesn't fit, try smaller spacing
      maxMultiplier = testMultiplier;
    }
    
    // If we're within 5px, good enough
    if (Math.abs(height - SAFE_HEIGHT_PX) < 5) {
      bestMultiplier = testMultiplier;
      break;
    }
  }
  
  return bestMultiplier;
}

/**
 * Main function to calculate optimal spacing for content
 */
export async function calculateOptimalSpacing(
  htmlContent: string, 
  baseCSS: string
): Promise<{ multiplier: number; css: string; estimatedHeight: number }> {
  const multiplier = await findOptimalSpacing(htmlContent, baseCSS);
  const css = spacingConfigToCSS(BASE_SPACING, multiplier);
  const estimatedHeight = await measureContentHeight(htmlContent, baseCSS, multiplier);
  
  return {
    multiplier,
    css,
    estimatedHeight
  };
}