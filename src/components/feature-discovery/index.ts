// Main Components
export { FeatureDiscovery } from './FeatureDiscovery';
export type { Feature, FeatureCategory, UserProgress } from './FeatureDiscovery';

export { FeatureTour, SAMPLE_TOURS } from './FeatureTour';
export type { TourStep, FeatureTourData } from './FeatureTour';

export { FeatureSpotlight, FEATURE_SPOTLIGHTS, useFeatureSpotlight } from './FeatureSpotlight';
export type { SpotlightFeature } from './FeatureSpotlight';

// Provider and Context
export {
  FeatureDiscoveryProvider,
  useFeatureDiscovery,
  withFeatureDiscovery,
  useContextualSuggestions
} from './FeatureDiscoveryProvider';
export type {
  FeatureDiscoveryState,
  FeatureDiscoveryContextValue
} from './FeatureDiscoveryProvider';

// Re-export common types
export type {
  FeatureDiscoveryState as DiscoveryState,
  FeatureDiscoveryContextValue as DiscoveryContextValue
} from './FeatureDiscoveryProvider';