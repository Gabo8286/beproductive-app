import React, { useState, useEffect } from 'react';
import { Project } from '../services/project-manager';
import { AssetRequest, AssetResponse } from '../services/asset-creation-studio';
import { Pipeline, DeploymentEnvironment } from '../services/devops-manager';
import { GitHubRepository } from '../services/platform-integrations';

interface DevelopmentHubProps {
  className?: string;
}

interface HubStats {
  projects: number;
  pipelines: number;
  deployments: number;
  m4Optimizations: number;
  assetsCreated: number;
}

export const DevelopmentHub: React.FC<DevelopmentHubProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'assets' | 'devops' | 'integrations'>('overview');
  const [stats, setStats] = useState<HubStats>({
    projects: 0,
    pipelines: 0,
    deployments: 0,
    m4Optimizations: 0,
    assetsCreated: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load data from all services via IPC
      const [projectsData, githubData, pipelinesData, environmentsData] = await Promise.all([
        window.electronAPI.invoke('hub:getProjects'),
        window.electronAPI.invoke('hub:getGitHubData'),
        window.electronAPI.invoke('hub:getPipelines'),
        window.electronAPI.invoke('hub:getEnvironments')
      ]);

      setProjects(projectsData || []);
      setRepositories(githubData?.repositories || []);
      setPipelines(pipelinesData || []);
      setEnvironments(environmentsData || []);

      // Calculate stats
      setStats({
        projects: projectsData?.length || 0,
        pipelines: pipelinesData?.length || 0,
        deployments: environmentsData?.length || 0,
        m4Optimizations: 12, // Mock data
        assetsCreated: 8 // Mock data
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const result = await window.electronAPI.invoke('hub:createProject', {
        name: 'New Project',
        type: 'react',
        template: 'react-vite'
      });

      if (result.success) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCreateAsset = async () => {
    const assetRequest: AssetRequest = {
      id: `asset_${Date.now()}`,
      type: 'component',
      description: 'Modern card component with hover animations',
      framework: 'react',
      style: 'modern',
      animations: {
        type: 'hover',
        duration: 300,
        effects: ['scale', 'fade']
      },
      context: {
        responsive: true,
        darkMode: true
      }
    };

    try {
      const result = await window.electronAPI.invoke('hub:createAsset', assetRequest);
      if (result.success) {
        console.log('Asset created successfully:', result);
      }
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  const handleRunM4Optimization = async (project: Project) => {
    try {
      const result = await window.electronAPI.invoke('hub:optimizeProject', {
        projectId: project.id,
        optimizationType: 'm4_acceleration'
      });

      if (result.success) {
        console.log('M4 optimization completed:', result.data);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('M4 optimization failed:', error);
    }
  };

  const handleDeployProject = async (project: Project) => {
    try {
      const result = await window.electronAPI.invoke('hub:deployProject', {
        projectId: project.id,
        environment: 'production'
      });

      if (result.success) {
        console.log('Deployment successful:', result.url);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Development Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Development Hub
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage all your projects with AI-powered development tools
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  M4 Optimized
                </span>
              </div>
              <button
                onClick={handleCreateProject}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'projects', label: 'Projects', icon: '📁' },
              { id: 'assets', label: 'Assets Studio', icon: '🎨' },
              { id: 'devops', label: 'DevOps', icon: '🔧' },
              { id: 'integrations', label: 'Integrations', icon: '🔗' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            projects={projects}
            repositories={repositories}
            onCreateProject={handleCreateProject}
            onCreateAsset={handleCreateAsset}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            projects={projects}
            onOptimize={handleRunM4Optimization}
            onDeploy={handleDeployProject}
          />
        )}

        {activeTab === 'assets' && (
          <AssetsTab onCreateAsset={handleCreateAsset} />
        )}

        {activeTab === 'devops' && (
          <DevOpsTab pipelines={pipelines} environments={environments} />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsTab repositories={repositories} />
        )}
      </main>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  stats: HubStats;
  projects: Project[];
  repositories: GitHubRepository[];
  onCreateProject: () => void;
  onCreateAsset: () => void;
}> = ({ stats, projects, repositories, onCreateProject, onCreateAsset }) => (
  <div className="space-y-8">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {[
        { label: 'Projects', value: stats.projects, icon: '📁', color: 'blue' },
        { label: 'Pipelines', value: stats.pipelines, icon: '🔧', color: 'green' },
        { label: 'Deployments', value: stats.deployments, icon: '🚀', color: 'purple' },
        { label: 'M4 Optimizations', value: stats.m4Optimizations, icon: '⚡', color: 'yellow' },
        { label: 'Assets Created', value: stats.assetsCreated, icon: '🎨', color: 'pink' }
      ].map(stat => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-3">{stat.icon}</div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Quick Actions */}
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New React Project', icon: '⚛️', action: onCreateProject },
          { label: 'Create UI Component', icon: '🎨', action: onCreateAsset },
          { label: 'Run M4 Optimization', icon: '⚡', action: () => {} },
          { label: 'Deploy to Production', icon: '🚀', action: () => {} }
        ].map(action => (
          <button
            key={action.label}
            onClick={action.action}
            className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Recent Projects */}
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Projects</h3>
      <div className="space-y-3">
        {projects.slice(0, 5).map(project => (
          <div
            key={project.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  {project.type === 'react' ? '⚛️' : '📁'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.framework}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${
                project.isGitRepo ? 'bg-green-400' : 'bg-gray-400'
              }`}></span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(project.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Projects Tab Component
const ProjectsTab: React.FC<{
  projects: Project[];
  onOptimize: (project: Project) => void;
  onDeploy: (project: Project) => void;
}> = ({ projects, onOptimize, onDeploy }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
      <div className="flex space-x-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Import Project
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Clone Repository
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <div
          key={project.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{project.framework}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              project.type === 'react' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              project.type === 'vue' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {project.type}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Package Manager:</span>
              <span className="text-gray-900 dark:text-white">{project.packageManager}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Git Status:</span>
              <span className={`${project.isGitRepo ? 'text-green-600' : 'text-gray-400'}`}>
                {project.isGitRepo ? 'Repository' : 'No Git'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Dependencies:</span>
              <span className="text-gray-900 dark:text-white">{project.dependencies?.length || 0}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onOptimize(project)}
              className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              ⚡ Optimize
            </button>
            <button
              onClick={() => onDeploy(project)}
              className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              🚀 Deploy
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Assets Tab Component
const AssetsTab: React.FC<{
  onCreateAsset: () => void;
}> = ({ onCreateAsset }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Asset Studio</h2>
      <button
        onClick={onCreateAsset}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Create Asset
      </button>
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Asset Creation</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Generate CSS, HTML, and JavaScript assets with AI. Create components, animations, and 3D effects with natural language.
      </p>

      {/* Asset creation features coming soon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'UI Components', icon: '🧩', description: 'React, Vue, or vanilla components' },
          { title: 'Animations', icon: '✨', description: 'CSS animations and transitions' },
          { title: '3D Effects', icon: '🎪', description: 'WebGL and Three.js effects' }
        ].map(feature => (
          <div key={feature.title} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{feature.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// DevOps Tab Component
const DevOpsTab: React.FC<{
  pipelines: Pipeline[];
  environments: DeploymentEnvironment[];
}> = ({ pipelines, environments }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DevOps & Deployment</h2>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pipelines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">CI/CD Pipelines</h3>
        <div className="space-y-3">
          {pipelines.map(pipeline => (
            <div key={pipeline.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{pipeline.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pipeline.project.name}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                pipeline.status === 'success' ? 'bg-green-100 text-green-800' :
                pipeline.status === 'failed' ? 'bg-red-100 text-red-800' :
                pipeline.status === 'running' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {pipeline.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Environments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Environments</h3>
        <div className="space-y-3">
          {environments.map(env => (
            <div key={env.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{env.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{env.platform}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                env.status === 'healthy' ? 'bg-green-100 text-green-800' :
                env.status === 'deploying' ? 'bg-blue-100 text-blue-800' :
                env.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {env.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Integrations Tab Component
const IntegrationsTab: React.FC<{
  repositories: GitHubRepository[];
}> = ({ repositories }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Integrations</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { name: 'GitHub', icon: '🐙', status: 'connected', repos: repositories.length },
        { name: 'Supabase', icon: '⚡', status: 'connected', projects: 1 },
        { name: 'IONOS', icon: '🌐', status: 'connected', servers: 2 }
      ].map(platform => (
        <div
          key={platform.name}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{platform.icon}</span>
              <span className="font-medium text-gray-900 dark:text-white">{platform.name}</span>
            </div>
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {platform.repos ? `${platform.repos} repositories` :
             platform.projects ? `${platform.projects} projects` :
             platform.servers ? `${platform.servers} servers` : 'Connected'}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// Add to global window type
declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

export default DevelopmentHub;