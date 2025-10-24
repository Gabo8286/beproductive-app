import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';

export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'react' | 'nextjs' | 'vue' | 'node' | 'python' | 'static' | 'unknown';
  isGitRepo: boolean;
  currentBranch?: string;
  hasRemote?: boolean;
  lastModified: Date;
  framework?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  scripts?: Record<string, string>;
  dependencies?: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: Project['type'];
  gitUrl?: string;
  commands: string[];
}

export class ProjectManager {
  private projects: Map<string, Project> = new Map();
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
    this.loadProjects();
  }

  // Project Discovery
  async scanDirectory(dirPath: string): Promise<Project[]> {
    const projects: Project[] = [];

    try {
      if (!fs.existsSync(dirPath)) {
        return projects;
      }

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const projectPath = path.join(dirPath, entry.name);
          const project = await this.analyzeProject(projectPath);

          if (project) {
            projects.push(project);
            this.projects.set(project.id, project);
          }
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
    }

    return projects;
  }

  private async analyzeProject(projectPath: string): Promise<Project | null> {
    try {
      const stats = fs.statSync(projectPath);
      const projectName = path.basename(projectPath);

      // Check if it's a valid project directory
      const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
      const hasPyproject = fs.existsSync(path.join(projectPath, 'pyproject.toml'));
      const hasRequirements = fs.existsSync(path.join(projectPath, 'requirements.txt'));
      const hasIndexHtml = fs.existsSync(path.join(projectPath, 'index.html'));

      if (!hasPackageJson && !hasPyproject && !hasRequirements && !hasIndexHtml) {
        return null;
      }

      // Analyze project type and framework
      const projectType = await this.detectProjectType(projectPath);
      const framework = await this.detectFramework(projectPath);
      const packageManager = await this.detectPackageManager(projectPath);

      // Check Git status
      const gitStatus = await this.getGitStatus(projectPath);

      // Read package.json for scripts and dependencies
      let scripts: Record<string, string> = {};
      let dependencies: string[] = [];

      if (hasPackageJson) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8')
          );
          scripts = packageJson.scripts || {};
          dependencies = Object.keys({
            ...packageJson.dependencies,
            ...packageJson.devDependencies
          });
        } catch (error) {
          console.error('Error reading package.json:', error);
        }
      }

      const project: Project = {
        id: `${projectName}-${Date.now()}`,
        name: projectName,
        path: projectPath,
        type: projectType,
        framework,
        packageManager,
        isGitRepo: gitStatus.isRepo,
        currentBranch: gitStatus.branch,
        hasRemote: gitStatus.hasRemote,
        lastModified: stats.mtime,
        scripts,
        dependencies
      };

      return project;
    } catch (error) {
      console.error(`Error analyzing project at ${projectPath}:`, error);
      return null;
    }
  }

  private async detectProjectType(projectPath: string): Promise<Project['type']> {
    // Check for Python projects
    if (fs.existsSync(path.join(projectPath, 'pyproject.toml')) ||
        fs.existsSync(path.join(projectPath, 'requirements.txt'))) {
      return 'python';
    }

    // Check for Node.js projects
    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8')
        );

        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.next) return 'nextjs';
        if (deps.react) return 'react';
        if (deps.vue) return 'vue';
        return 'node';
      } catch (error) {
        return 'node';
      }
    }

    // Check for static HTML projects
    if (fs.existsSync(path.join(projectPath, 'index.html'))) {
      return 'static';
    }

    return 'unknown';
  }

  private async detectFramework(projectPath: string): Promise<string | undefined> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) return undefined;

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Framework detection logic
      const frameworks = [
        { name: 'Next.js', key: 'next' },
        { name: 'React', key: 'react' },
        { name: 'Vue', key: 'vue' },
        { name: 'Nuxt', key: 'nuxt' },
        { name: 'Svelte', key: 'svelte' },
        { name: 'Angular', key: '@angular/core' },
        { name: 'Express', key: 'express' },
        { name: 'Fastify', key: 'fastify' },
        { name: 'Vite', key: 'vite' }
      ];

      for (const framework of frameworks) {
        if (deps[framework.key]) {
          return framework.name;
        }
      }

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private async detectPackageManager(projectPath: string): Promise<Project['packageManager']> {
    if (fs.existsSync(path.join(projectPath, 'bun.lockb'))) return 'bun';
    if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) return 'npm';
    return 'npm';
  }

  private async getGitStatus(projectPath: string) {
    try {
      const git = simpleGit(projectPath);

      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        return { isRepo: false };
      }

      const status = await git.status();
      const remotes = await git.getRemotes(true);

      return {
        isRepo: true,
        branch: status.current,
        hasRemote: remotes.length > 0,
        isDirty: !status.isClean()
      };
    } catch (error) {
      return { isRepo: false };
    }
  }

  // Project Management
  async createProject(template: ProjectTemplate, targetPath: string, projectName: string): Promise<Project | null> {
    try {
      const projectPath = path.join(targetPath, projectName);

      // Create project directory
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }

      // Clone from template if git URL provided
      if (template.gitUrl) {
        const git = simpleGit();
        await git.clone(template.gitUrl, projectPath);
      }

      // Execute template commands
      for (const command of template.commands) {
        // Execute setup commands here
        console.log(`Executing: ${command}`);
      }

      // Analyze the created project
      const project = await this.analyzeProject(projectPath);

      if (project) {
        this.projects.set(project.id, project);
        this.saveProjects();
      }

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const project = this.projects.get(projectId);
      if (!project) return false;

      // Remove from memory
      this.projects.delete(projectId);
      this.saveProjects();

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Git Operations
  async gitCommand(projectId: string, command: string, args: string[] = []): Promise<any> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const git = simpleGit(project.path);

    switch (command) {
      case 'status':
        return await git.status();
      case 'add':
        return await git.add(args);
      case 'commit':
        return await git.commit(args[0]);
      case 'push':
        return await git.push();
      case 'pull':
        return await git.pull();
      case 'checkout':
        return await git.checkout(args[0]);
      case 'branch':
        return await git.branch(args);
      default:
        throw new Error(`Unknown git command: ${command}`);
    }
  }

  // Project Templates
  getProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'react-vite',
        name: 'React + Vite',
        description: 'Modern React app with Vite bundler',
        type: 'react',
        commands: ['npm create vite@latest . -- --template react-ts', 'npm install']
      },
      {
        id: 'nextjs',
        name: 'Next.js App',
        description: 'Full-stack React framework',
        type: 'nextjs',
        commands: ['npx create-next-app@latest . --typescript --tailwind --eslint --app']
      },
      {
        id: 'vue-vite',
        name: 'Vue + Vite',
        description: 'Vue.js app with Vite',
        type: 'vue',
        commands: ['npm create vue@latest .', 'npm install']
      },
      {
        id: 'node-express',
        name: 'Node.js + Express',
        description: 'Express.js backend server',
        type: 'node',
        commands: ['npm init -y', 'npm install express', 'npm install -D nodemon typescript @types/node']
      },
      {
        id: 'static-html',
        name: 'Static HTML',
        description: 'Simple HTML/CSS/JS website',
        type: 'static',
        commands: []
      }
    ];
  }

  // Data Persistence
  private loadProjects() {
    try {
      // In a real app, this would load from electron-store or a file
      const stored = localStorage.getItem('spark-bloom-projects');
      if (stored) {
        const projectsArray = JSON.parse(stored);
        projectsArray.forEach((project: Project) => {
          this.projects.set(project.id, project);
        });
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  private saveProjects() {
    try {
      const projectsArray = Array.from(this.projects.values());
      localStorage.setItem('spark-bloom-projects', JSON.stringify(projectsArray));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  // Getters
  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  searchProjects(query: string): Project[] {
    return this.getAllProjects().filter(project =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      (project.framework && project.framework.toLowerCase().includes(query.toLowerCase()))
    );
  }
}