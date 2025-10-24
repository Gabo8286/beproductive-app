import { Project } from './project-manager';
import { EnhancedMCPClient, MCPRequest } from './enhanced-mcp-client';

export interface AssetRequest {
  id: string;
  type: 'component' | 'animation' | 'layout' | '3d_effect' | 'theme' | 'icon';
  description: string;
  framework?: 'react' | 'vue' | 'vanilla' | 'tailwind' | 'css';
  style?: 'modern' | 'minimal' | 'glassmorphism' | 'neumorphism' | 'retro' | 'apple_design';
  context?: {
    project?: Project;
    existingCode?: string;
    colorPalette?: string[];
    dimensions?: { width: number; height: number };
    responsive?: boolean;
    darkMode?: boolean;
  };
  animations?: {
    type: 'hover' | 'click' | 'scroll' | 'load' | 'continuous';
    duration?: number;
    easing?: string;
    effects?: string[];
  };
  threeDEffects?: {
    depth?: number;
    perspective?: number;
    lighting?: 'ambient' | 'directional' | 'point';
    materials?: string[];
  };
}

export interface AssetResponse {
  id: string;
  success: boolean;
  asset?: {
    html: string;
    css: string;
    javascript?: string;
    preview: string;
    animations?: {
      keyframes: string;
      classes: string[];
    };
    threeDData?: {
      webglCode?: string;
      threeJsCode?: string;
      shaders?: {
        vertex: string;
        fragment: string;
      };
    };
    responsive?: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  };
  metadata?: {
    generationTime: number;
    complexity: 'simple' | 'medium' | 'complex';
    dependencies: string[];
    browserSupport: string[];
    performance: {
      renderTime: number;
      memoryUsage: number;
      accessibility: number;
    };
  };
  error?: string;
}

export interface AssetLibrary {
  id: string;
  name: string;
  description: string;
  assets: SavedAsset[];
  tags: string[];
  created: Date;
  updated: Date;
}

export interface SavedAsset {
  id: string;
  name: string;
  type: AssetRequest['type'];
  thumbnail: string;
  code: {
    html: string;
    css: string;
    javascript?: string;
  };
  metadata: {
    framework: string;
    style: string;
    animations: boolean;
    threeDEffects: boolean;
    responsive: boolean;
    darkMode: boolean;
  };
  created: Date;
  usage: number;
}

export class AssetCreationStudio {
  private mcpClient: EnhancedMCPClient;
  private libraries: Map<string, AssetLibrary> = new Map();
  private previewServer: any = null;

  constructor() {
    this.mcpClient = new EnhancedMCPClient();
    this.loadLibraries();
  }

  async initialize(): Promise<{ success: boolean; previewPort?: number }> {
    console.log('🎨 Initializing Asset Creation Studio...');

    try {
      // Start local preview server
      const previewPort = await this.startPreviewServer();

      console.log('✅ Asset Creation Studio initialized');
      console.log(`🖥️ Preview server running on port ${previewPort}`);

      return {
        success: true,
        previewPort
      };

    } catch (error) {
      console.error('❌ Asset Creation Studio initialization failed:', error);
      return {
        success: false
      };
    }
  }

  async createAsset(request: AssetRequest): Promise<AssetResponse> {
    const startTime = Date.now();

    try {
      console.log(`🎨 Creating ${request.type} asset: "${request.description}"`);

      // Build AI prompt for asset creation
      const aiPrompt = this.buildAssetPrompt(request);

      // Use MCP client for AI generation
      const mcpRequest: MCPRequest = {
        id: request.id,
        type: 'code_generation',
        prompt: aiPrompt,
        context: {
          project: request.context?.project,
          language: this.getLanguageForFramework(request.framework),
          framework: request.framework
        },
        options: {
          model: 'claude',
          maxTokens: 4000,
          temperature: 0.7
        }
      };

      const mcpResponse = await this.mcpClient.processRequest(mcpRequest);

      if (!mcpResponse.success) {
        throw new Error(mcpResponse.error || 'AI generation failed');
      }

      // Parse and enhance the generated code
      const asset = await this.processGeneratedCode(mcpResponse.data, request);

      // Generate preview
      const preview = await this.generatePreview(asset);

      // Calculate performance metrics
      const performance = await this.analyzePerformance(asset);

      const generationTime = Date.now() - startTime;

      return {
        id: request.id,
        success: true,
        asset: {
          ...asset,
          preview
        },
        metadata: {
          generationTime,
          complexity: this.determineComplexity(request),
          dependencies: this.extractDependencies(asset),
          browserSupport: this.getBrowserSupport(request),
          performance
        }
      };

    } catch (error) {
      return {
        id: request.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          generationTime: Date.now() - startTime,
          complexity: 'simple',
          dependencies: [],
          browserSupport: [],
          performance: {
            renderTime: 0,
            memoryUsage: 0,
            accessibility: 0
          }
        }
      };
    }
  }

  private buildAssetPrompt(request: AssetRequest): string {
    let prompt = `Create a ${request.type} with the following description:\n\n"${request.description}"\n\n`;

    // Framework-specific instructions
    if (request.framework) {
      prompt += `Framework: ${request.framework}\n`;
    }

    // Style requirements
    if (request.style) {
      prompt += `Style: ${request.style}\n`;
    }

    // Context information
    if (request.context) {
      const { colorPalette, dimensions, responsive, darkMode } = request.context;

      if (colorPalette) {
        prompt += `Color palette: ${colorPalette.join(', ')}\n`;
      }

      if (dimensions) {
        prompt += `Dimensions: ${dimensions.width}x${dimensions.height}px\n`;
      }

      if (responsive) {
        prompt += `Must be responsive (mobile, tablet, desktop)\n`;
      }

      if (darkMode) {
        prompt += `Include dark mode support\n`;
      }
    }

    // Animation requirements
    if (request.animations) {
      prompt += `\nAnimations:\n`;
      prompt += `- Type: ${request.animations.type}\n`;
      prompt += `- Duration: ${request.animations.duration || 300}ms\n`;
      prompt += `- Easing: ${request.animations.easing || 'ease-in-out'}\n`;

      if (request.animations.effects) {
        prompt += `- Effects: ${request.animations.effects.join(', ')}\n`;
      }
    }

    // 3D effects requirements
    if (request.threeDEffects) {
      prompt += `\n3D Effects:\n`;
      prompt += `- Depth: ${request.threeDEffects.depth || 10}px\n`;
      prompt += `- Perspective: ${request.threeDEffects.perspective || 1000}px\n`;
      prompt += `- Lighting: ${request.threeDEffects.lighting || 'ambient'}\n`;

      if (request.threeDEffects.materials) {
        prompt += `- Materials: ${request.threeDEffects.materials.join(', ')}\n`;
      }
    }

    // Output requirements
    prompt += `\nPlease provide:\n`;
    prompt += `1. Complete HTML structure\n`;
    prompt += `2. CSS styles (including animations if requested)\n`;
    prompt += `3. JavaScript code if needed for interactivity\n`;
    prompt += `4. Responsive breakpoints if requested\n`;
    prompt += `5. Performance-optimized code\n`;
    prompt += `6. Accessibility features (ARIA labels, semantic HTML)\n`;

    if (request.framework === 'react') {
      prompt += `7. React component with TypeScript types\n`;
    } else if (request.framework === 'vue') {
      prompt += `7. Vue.js component with composition API\n`;
    }

    prompt += `\nEnsure the code is production-ready, well-commented, and follows modern best practices.`;

    return prompt;
  }

  private getLanguageForFramework(framework?: string): string {
    switch (framework) {
      case 'react': return 'typescript';
      case 'vue': return 'typescript';
      case 'vanilla': return 'javascript';
      case 'tailwind': return 'html';
      case 'css': return 'css';
      default: return 'html';
    }
  }

  private async processGeneratedCode(generatedData: any, request: AssetRequest) {
    // Extract HTML, CSS, and JavaScript from AI response
    const codeBlocks = this.extractCodeBlocks(generatedData);

    let asset = {
      html: codeBlocks.html || '',
      css: codeBlocks.css || '',
      javascript: codeBlocks.javascript || undefined
    };

    // Add animations if requested
    if (request.animations) {
      asset = await this.enhanceWithAnimations(asset, request.animations);
    }

    // Add 3D effects if requested
    if (request.threeDEffects) {
      asset = await this.enhanceWith3DEffects(asset, request.threeDEffects);
    }

    // Add responsive styles if requested
    if (request.context?.responsive) {
      asset = await this.enhanceWithResponsive(asset);
    }

    // Add dark mode if requested
    if (request.context?.darkMode) {
      asset = await this.enhanceWithDarkMode(asset);
    }

    return asset;
  }

  private extractCodeBlocks(data: any): { html?: string; css?: string; javascript?: string } {
    if (typeof data === 'string') {
      // Extract code blocks from markdown-style response
      const htmlMatch = data.match(/```html\n([\s\S]*?)\n```/);
      const cssMatch = data.match(/```css\n([\s\S]*?)\n```/);
      const jsMatch = data.match(/```(?:javascript|js)\n([\s\S]*?)\n```/);

      return {
        html: htmlMatch?.[1],
        css: cssMatch?.[1],
        javascript: jsMatch?.[1]
      };
    }

    return data;
  }

  private async enhanceWithAnimations(asset: any, animations: AssetRequest['animations']) {
    if (!animations) return asset;

    const animationCSS = this.generateAnimationCSS(animations);

    return {
      ...asset,
      css: asset.css + '\n\n' + animationCSS,
      animations: {
        keyframes: animationCSS,
        classes: this.extractAnimationClasses(animationCSS)
      }
    };
  }

  private generateAnimationCSS(animations: NonNullable<AssetRequest['animations']>): string {
    const { type, duration = 300, easing = 'ease-in-out', effects = [] } = animations;

    let css = `/* Animation CSS */\n`;

    switch (type) {
      case 'hover':
        css += `.animated-element:hover {\n`;
        css += `  transition: all ${duration}ms ${easing};\n`;
        if (effects.includes('scale')) css += `  transform: scale(1.05);\n`;
        if (effects.includes('fade')) css += `  opacity: 0.8;\n`;
        if (effects.includes('rotate')) css += `  transform: rotate(5deg);\n`;
        css += `}\n`;
        break;

      case 'load':
        css += `@keyframes fadeInUp {\n`;
        css += `  from {\n    opacity: 0;\n    transform: translateY(30px);\n  }\n`;
        css += `  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n`;
        css += `}\n\n`;
        css += `.animated-element {\n`;
        css += `  animation: fadeInUp ${duration}ms ${easing};\n`;
        css += `}\n`;
        break;

      case 'continuous':
        css += `@keyframes pulse {\n`;
        css += `  0%, 100% { transform: scale(1); }\n`;
        css += `  50% { transform: scale(1.05); }\n`;
        css += `}\n\n`;
        css += `.animated-element {\n`;
        css += `  animation: pulse ${duration * 2}ms infinite ${easing};\n`;
        css += `}\n`;
        break;
    }

    return css;
  }

  private extractAnimationClasses(css: string): string[] {
    const classMatches = css.match(/\.([a-zA-Z-]+)/g);
    return classMatches ? classMatches.map(match => match.substring(1)) : [];
  }

  private async enhanceWith3DEffects(asset: any, threeDEffects: AssetRequest['threeDEffects']) {
    if (!threeDEffects) return asset;

    const threeDCSS = this.generate3DCSS(threeDEffects);
    const webglCode = this.generateWebGLCode(threeDEffects);

    return {
      ...asset,
      css: asset.css + '\n\n' + threeDCSS,
      threeDData: {
        webglCode,
        threeJsCode: this.generateThreeJSCode(threeDEffects),
        shaders: {
          vertex: this.generateVertexShader(),
          fragment: this.generateFragmentShader()
        }
      }
    };
  }

  private generate3DCSS(effects: NonNullable<AssetRequest['threeDEffects']>): string {
    const { depth = 10, perspective = 1000 } = effects;

    return `/* 3D Effects CSS */
.three-d-container {
  perspective: ${perspective}px;
  perspective-origin: center center;
}

.three-d-element {
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.three-d-element:hover {
  transform: rotateX(15deg) rotateY(15deg) translateZ(${depth}px);
}

.depth-shadow {
  box-shadow:
    0 ${depth}px ${depth * 2}px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}`;
  }

  private generateWebGLCode(effects: NonNullable<AssetRequest['threeDEffects']>): string {
    return `// WebGL 3D Effect Code
const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

// Vertex shader source
const vertexShaderSource = \`
  attribute vec4 a_position;
  attribute vec2 a_texCoord;
  uniform mat4 u_matrix;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = u_matrix * a_position;
    v_texCoord = a_texCoord;
  }
\`;

// Fragment shader source
const fragmentShaderSource = \`
  precision mediump float;
  uniform sampler2D u_texture;
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
\`;

// Initialize WebGL context and shaders
function initWebGL() {
  // WebGL initialization code here
  console.log('WebGL 3D effects initialized');
}`;
  }

  private generateThreeJSCode(effects: NonNullable<AssetRequest['threeDEffects']>): string {
    return `// Three.js 3D Scene
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create 3D geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();`;
  }

  private generateVertexShader(): string {
    return `attribute vec4 a_position;
attribute vec2 a_texCoord;
uniform mat4 u_matrix;
varying vec2 v_texCoord;

void main() {
  gl_Position = u_matrix * a_position;
  v_texCoord = a_texCoord;
}`;
  }

  private generateFragmentShader(): string {
    return `precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_texCoord;

void main() {
  vec4 color = texture2D(u_texture, v_texCoord);
  gl_FragColor = color;
}`;
  }

  private async enhanceWithResponsive(asset: any) {
    const responsiveCSS = `
/* Responsive Design */
@media (max-width: 768px) {
  .responsive-element {
    width: 100%;
    padding: 1rem;
    font-size: 0.9rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .responsive-element {
    width: 80%;
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (min-width: 1025px) {
  .responsive-element {
    width: 60%;
    padding: 2rem;
    font-size: 1.1rem;
  }
}`;

    return {
      ...asset,
      css: asset.css + '\n\n' + responsiveCSS,
      responsive: {
        mobile: this.extractResponsiveCSS(responsiveCSS, 'mobile'),
        tablet: this.extractResponsiveCSS(responsiveCSS, 'tablet'),
        desktop: this.extractResponsiveCSS(responsiveCSS, 'desktop')
      }
    };
  }

  private extractResponsiveCSS(css: string, breakpoint: string): string {
    // Extract CSS for specific breakpoint
    switch (breakpoint) {
      case 'mobile':
        return css.match(/@media \(max-width: 768px\) \{([\s\S]*?)\}/)?.[1] || '';
      case 'tablet':
        return css.match(/@media \(min-width: 769px\) and \(max-width: 1024px\) \{([\s\S]*?)\}/)?.[1] || '';
      case 'desktop':
        return css.match(/@media \(min-width: 1025px\) \{([\s\S]*?)\}/)?.[1] || '';
      default:
        return '';
    }
  }

  private async enhanceWithDarkMode(asset: any) {
    const darkModeCSS = `
/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .themed-element {
    background-color: #1a1a1a;
    color: #ffffff;
    border-color: #333333;
  }

  .themed-element:hover {
    background-color: #2a2a2a;
  }
}

.dark .themed-element {
  background-color: #1a1a1a;
  color: #ffffff;
  border-color: #333333;
}`;

    return {
      ...asset,
      css: asset.css + '\n\n' + darkModeCSS
    };
  }

  private async generatePreview(asset: any): Promise<string> {
    // Generate complete HTML preview
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asset Preview</title>
  <style>
    ${asset.css}
  </style>
</head>
<body>
  ${asset.html}
  ${asset.javascript ? `<script>${asset.javascript}</script>` : ''}
</body>
</html>`;
  }

  private async analyzePerformance(asset: any) {
    // Simulate performance analysis
    const cssSize = asset.css.length;
    const htmlSize = asset.html.length;
    const jsSize = asset.javascript?.length || 0;

    return {
      renderTime: Math.max(10, cssSize / 100), // Simulate render time
      memoryUsage: htmlSize + cssSize + jsSize, // Simulate memory usage
      accessibility: this.calculateAccessibilityScore(asset) // Simulate a11y score
    };
  }

  private calculateAccessibilityScore(asset: any): number {
    let score = 80; // Base score

    // Check for semantic HTML
    if (asset.html.includes('<header>')) score += 5;
    if (asset.html.includes('<main>')) score += 5;
    if (asset.html.includes('<nav>')) score += 5;

    // Check for ARIA labels
    if (asset.html.includes('aria-label')) score += 5;

    return Math.min(100, score);
  }

  private determineComplexity(request: AssetRequest): 'simple' | 'medium' | 'complex' {
    let complexity = 0;

    if (request.animations) complexity += 1;
    if (request.threeDEffects) complexity += 2;
    if (request.context?.responsive) complexity += 1;
    if (request.framework === 'react' || request.framework === 'vue') complexity += 1;

    if (complexity <= 1) return 'simple';
    if (complexity <= 3) return 'medium';
    return 'complex';
  }

  private extractDependencies(asset: any): string[] {
    const dependencies: string[] = [];

    if (asset.javascript?.includes('import')) {
      dependencies.push('ES6 Modules');
    }

    if (asset.threeDData) {
      dependencies.push('WebGL', 'Three.js');
    }

    if (asset.animations) {
      dependencies.push('CSS Animations');
    }

    return dependencies;
  }

  private getBrowserSupport(request: AssetRequest): string[] {
    const support = ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+'];

    if (request.threeDEffects) {
      support.push('WebGL Support Required');
    }

    return support;
  }

  private async startPreviewServer(): Promise<number> {
    // Simulate starting a preview server
    const port = 3001 + Math.floor(Math.random() * 1000);
    console.log(`🖥️ Preview server would start on port ${port}`);
    return port;
  }

  // Asset Library Management
  async saveAsset(asset: AssetResponse, name: string, libraryId?: string): Promise<boolean> {
    try {
      if (!asset.success || !asset.asset) {
        throw new Error('Cannot save invalid asset');
      }

      const savedAsset: SavedAsset = {
        id: asset.id,
        name,
        type: 'component', // Would be determined from original request
        thumbnail: await this.generateThumbnail(asset.asset),
        code: {
          html: asset.asset.html,
          css: asset.asset.css,
          javascript: asset.asset.javascript
        },
        metadata: {
          framework: 'vanilla', // Would be from original request
          style: 'modern', // Would be from original request
          animations: !!asset.asset.animations,
          threeDEffects: !!asset.asset.threeDData,
          responsive: !!asset.asset.responsive,
          darkMode: asset.asset.css.includes('prefers-color-scheme: dark')
        },
        created: new Date(),
        usage: 0
      };

      // Add to library or create new one
      if (libraryId) {
        const library = this.libraries.get(libraryId);
        if (library) {
          library.assets.push(savedAsset);
          library.updated = new Date();
        }
      } else {
        // Create new library
        const newLibrary: AssetLibrary = {
          id: `lib_${Date.now()}`,
          name: `Assets ${new Date().toLocaleDateString()}`,
          description: 'Custom asset library',
          assets: [savedAsset],
          tags: ['custom'],
          created: new Date(),
          updated: new Date()
        };
        this.libraries.set(newLibrary.id, newLibrary);
      }

      this.saveLibraries();
      console.log(`💾 Asset saved: ${name}`);
      return true;

    } catch (error) {
      console.error('Failed to save asset:', error);
      return false;
    }
  }

  private async generateThumbnail(asset: any): Promise<string> {
    // Generate base64 thumbnail
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#f0f0f0"/>
        <text x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12">
          Asset
        </text>
      </svg>
    `);
  }

  async getLibraries(): Promise<AssetLibrary[]> {
    return Array.from(this.libraries.values());
  }

  async getAssetsByLibrary(libraryId: string): Promise<SavedAsset[]> {
    const library = this.libraries.get(libraryId);
    return library ? library.assets : [];
  }

  private loadLibraries() {
    try {
      // In a real implementation, this would load from storage
      console.log('📚 Loading asset libraries...');
    } catch (error) {
      console.error('Failed to load libraries:', error);
    }
  }

  private saveLibraries() {
    try {
      // In a real implementation, this would save to storage
      console.log('💾 Saving asset libraries...');
    } catch (error) {
      console.error('Failed to save libraries:', error);
    }
  }
}