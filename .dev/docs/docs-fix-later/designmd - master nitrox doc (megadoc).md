10.01.2026 12:24PM from gemini for now lol:

# **DESIGN.md — Nitrox Visual & Interface System**

## **1\. Brand & Design Philosophy**

Nitrox sits at the intersection of **futuristic/modern** and **down-to-earth**.

* **Futuristic & Modern:** Precision typography, fluid micro-interactions, spatial depth, and high-tech optical refraction.  
*   
* **Down to Earth:** Grounded layout systems, warm ambient backdrops, readable contrast, and tactical utility. Software shouldn't feel like a disconnected sci-fi prop—it should feel like a tangible, high-grade physical instrument designed to serve your mind.  
*   
* **Core Philosophy:** Fixing technology through intentionality. Liquid precision over flashy distractor elements.  
* 

## **2\. Color System & Palette Strategy**

### **Color Unification Strategy**

Yes, you **should align the brand color palette directly with the flagship Nitrox apps (Tesseract & Prism)**. Using a shared color token system across the parent ecosystem and products creates instant brand recognition while preserving functional clarity.

### **Primary Tokens**

| Role | Color Name | Hex / Value | Usage |
| :---- | :---- | :---- | :---- |
| **Brand Primary** | Electric Nitrox Blue | \#3232FF | Active states, primary action buttons, key brand focal points, dynamic lighting highlights. |
| **Brand Secondary** | Atmosphere Blue | \#79ADF2 | Secondary actions, liquid glass refractions, subtle borders, ambient gradients. |
| **Base Surface (Dark)** | Carbon Obsidian | \#0B0C10 | Deep background layer, dark mode base, high-contrast container backdrop. |
| **Base Surface (Light)** | Frosted Ice | \#F4F6FA | Light mode background layer, soft glass backing. |
| **Liquid Metal Accent** | Mercury Chrome | linear-gradient(135deg, \#E2E8F0, \#94A3B8, \#64748B) | Metallic edge highlights, interactive button borders, elevated sheen effects. |

### **Color Modes & Glass Token Mapping**

CSS  
:root {  
  /\* Core Brand Colors \*/  
  \--nitrox-primary: \#3232FF;  
  \--nitrox-secondary: \#79ADF2;  
  \--nitrox-glow: rgba(50, 50, 255, 0.35);

  /\* Modern Skeuomorphic Glass (Dark Theme) \*/  
  \--glass-bg: rgba(15, 23, 42, 0.65);  
  \--glass-border: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(121, 173, 242, 0.1));  
  \--liquid-metal-edge: rgba(255, 255, 255, 0.4);  
  \--glass-blur: blur(20px) saturate(180%);  
}

## **3\. Modern Skeuomorphism: Liquid Glass & Chrome Motion**

Modern skeuomorphism moves away from heavy 2010s textures (leather, stitched seams) into **tactile material physics**: glass refraction, chrome rim lighting, physical depth, and fluid motion (inspired by liquid glass, Twitter concepts, and modern motion graphics).

### **A. Material Stack**

1. **Background Layer:** Dark Carbon \#0B0C10 with subtle noise texture (1–2% opacity) to eliminate color banding.  
2.   
3. **Liquid Glass Containers:**  
4. 

   * Translucent surface fill with multi-layered drop shadows.  
   *   
   * Backdrop blur (backdrop-filter: blur(16px) saturate(180%)).  
   *   
   * Specular highlights on top edges using fine 1px gradients (rgba(255, 255, 255, 0.3) to transparent).  
   *   
5. **Liquid Metal Elements (Buttons, Badges, Borders):**  
6. 

   * Dynamic metallic gradients that shift slightly on hover or cursor movement.  
   *   
   * High-contrast specular reflections along outer strokes to mimic chrome or polished aluminum edges.  
   * 

### **B. Depth & Elevation Scale**

Level 0: Canvas (Flat Obsidian \#0B0C10)  
Level 1: Pane Glass (Subtle blur, 1px border at 10% white)  
Level 2: Card / Module (Liquid Glass fill, 1px gradient stroke, soft drop shadow)  
Level 3: Interactive Controls / Floating Windows (High Specular rim light, strong glow \#3232FF)

### **C. Motion Physics & Motion Graphics**

* **Fluid Reactivity:** Elements scale and deform slightly on press or drag (cubic-bezier(0.16, 1, 0.3, 1\) easing for snappy, springy response).  
*   
* **Refractive Light Sweeps:** Hover states feature a subtle light sheen passing diagonally across the glass face.  
*   
* **Liquid Transitions:** State changes shift fluidly like liquid metal merging or separating rather than hard cut flips.  
* 

## **4\. Component Design Specifications**

### **1\. Liquid Glass Card / Container**

* **Background:** rgba(20, 24, 38, 0.6)  
*   
* **Border:** 1px solid with a continuous gradient from top-left (rgba(255, 255, 255, 0.2)) to bottom-right (rgba(121, 173, 242, 0.05)).  
*   
* **Box Shadow:**  
* 

  * Inset shadow for beveling: inset 0 1px 1px rgba(255, 255, 255, 0.25)  
  *   
  * Ambient drop shadow: 0 20px 40px rgba(0, 0, 0, 0.4)  
  * 

### **2\. Primary Action Button (Nitrox Electric)**

* **Background:** linear-gradient(135deg, \#3232FF 0%, \#1A1ACC 100%)  
*   
* **Rim Highlight:** Top border 1px solid rgba(255, 255, 255, 0.4)  
*   
* **Glow:** 0 0 20px rgba(50, 50, 255, 0.5) on hover.  
*   
* **Text:** \#FFFFFF with slight text shadow 0 1px 2px rgba(0, 0, 0, 0.5).  
* 

### **3\. Liquid Metal Accent Badge / Pill**

* **Background:** linear-gradient(180deg, \#2A2F3D 0%, \#161922 100%)  
*   
* **Border:** 1px solid rgba(255, 255, 255, 0.2)  
*   
* **Refractive Edge:** Accentuated corner lighting using \--nitrox-secondary (\#79ADF2).  
* 

## **5\. Typography & Grid Layout**

* **Display / Brand Font:** Modern Geometric Sans (e.g., Inter, Space Grotesk, or SF Pro Display) with tight tracking (\-0.02em) for headers.  
*   
* **Monospace / Data Font:** JetBrains Mono or SF Mono for technical indicators, timestamps, or system metrics.  
*   
* **Layout Grid:** 12-column dynamic responsive grid with generous padding (padding drives the "down to earth" spacious feel, balancing the dense high-tech aesthetic).  
* 

## **6\. Guidelines for AI Agents & Humans**

### **For Human Designers / Developers:**

* **Maintain Performance:** Keep backdrop filters optimized. Use will-change: transform sparingly on liquid metal motion components to preserve smooth rendering on lower-spec hardware (e.g., lightweight laptops).  
*   
* **Avoid Over-Skeuomorphism:** Don't add unnecessary texture overlays (e.g., wood, grain, leather). Limit textures to glass refraction, chrome highlights, and soft light glows.  
* 

### **For AI Code Generators (React, Tailwind, CSS):**

* Always generate container styles using backdrop-blur, subtle high-angle border highlights, and CSS variables referencing \--nitrox-primary (\#3232FF) and \--nitrox-secondary (\#79ADF2).  
*   
* Ensure text legibility by enforcing minimum contrast ratios over frosted glass backdrops using dark translucent overlays when necessary.

