import { OpenClawProviderId, ProviderRegistry } from '@shared/providers/constants';

import type { Model } from '../store/slices/modelSlice';

export function toOpenClawModelRef(model: Pick<Model, 'id' | 'providerKey' | 'isServerModel'>): string {
  if (model.isServerModel) {
    return `${OpenClawProviderId.LobsteraiServer}/${model.id}`;
  }

  return `${ProviderRegistry.getOpenClawProviderId(model.providerKey ?? '')}/${model.id}`;
}

export function matchesOpenClawModelRef(
  modelRef: string,
  model: Pick<Model, 'id' | 'providerKey' | 'isServerModel'>,
): boolean {
  const normalizedRef = modelRef.trim();
  if (!normalizedRef) return false;
  if (normalizedRef.includes('/')) {
    return normalizedRef === toOpenClawModelRef(model);
  }
  return normalizedRef === model.id;
}

export function resolveOpenClawModelRef<T extends Pick<Model, 'id' | 'providerKey' | 'isServerModel'>>(
  modelRef: string,
  availableModels: T[],
): T | null {
  const normalizedRef = modelRef.trim();
  if (!normalizedRef) return null;

  if (normalizedRef.includes('/')) {
    const exactMatch = availableModels.find((model) => toOpenClawModelRef(model) === normalizedRef);
    if (exactMatch) return exactMatch;

    const modelId = normalizedRef.split('/').pop()!;
    const idMatches = availableModels.filter((model) => model.id === modelId);
    if (idMatches.length === 1) {
      console.log('[openclawModelRef] provider fallback: resolved', normalizedRef, 'to', toOpenClawModelRef(idMatches[0]));
      return idMatches[0];
    }
    return null;
  }

  const matchingModels = availableModels.filter((model) => model.id === normalizedRef);
  return matchingModels.length === 1 ? matchingModels[0] : null;
}
