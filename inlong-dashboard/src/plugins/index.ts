/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useState, useEffect, useCallback } from 'react';
import type { MetaExportWithBackendList } from '@/plugins/types';
import { consumes, defaultValue as defaultConsume } from './consumes';
import { groups, defaultValue as defaultGroup } from './groups';
import { clusters, defaultValue as defaultCluster } from './clusters';
import { nodes, defaultValue as defaultNode } from './nodes';
import { streams, defaultValue as defaultStream } from './streams';
import { sources, defaultValue as defaultSource } from './sources';
import { sinks, defaultValue as defaultSink } from './sinks';
import { sync, defaultValue as defaultSync } from './sync';
import { transform, defaultValue as defaultTransform } from './transform';

export type {
  ClusterMetaType,
  ConsumeMetaType,
  GroupMetaType,
  NodeMetaType,
  SourceMetaType,
  SinkMetaType,
  StreamMetaType,
  SyncMetaType,
  TransformMetaType,
} from './types';

export interface UseLoadMetaResult<T> {
  loading: boolean;
  Entity: T;
}

export type MetaTypeKeys =
  | 'consume'
  | 'group'
  | 'cluster'
  | 'node'
  | 'stream'
  | 'source'
  | 'sink'
  | 'sync'
  | 'transform';

const metasMap: Record<MetaTypeKeys, [MetaExportWithBackendList<any>, string?]> = {
  consume: [consumes, defaultConsume],
  group: [groups, defaultGroup],
  cluster: [clusters, defaultCluster],
  node: [nodes, defaultNode],
  stream: [streams, defaultStream],
  source: [sources, defaultSource],
  sink: [sinks, defaultSink],
  sync: [sync, defaultSync],
  transform: [transform, defaultTransform],
};

export const useDefaultMeta = (metaType: MetaTypeKeys) => {
  const [options = [], defaultValue] = metasMap[metaType];
  return {
    defaultValue: defaultValue || options[0].value,
    options: options.map(item => ({ label: item.label, value: item.value })),
  };
};

export const useLoadMeta = <T>(metaType: MetaTypeKeys, subType: string): UseLoadMetaResult<T> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<Record<string, { default: T }>>();
  const [Entity, setEntity] = useState<{ default: T }>();

  const { defaultValue } = useDefaultMeta(metaType);

  const load = useCallback(
    async _subType => {
      const subList = metasMap[metaType]?.[0];
      const LoadEntity =
        subList?.find(item => item.value === _subType)?.LoadEntity ||
        subList?.find(item => item.value === defaultValue)?.LoadEntity;
      if (LoadEntity) {
        setLoading(true);
        try {
          const result = await LoadEntity();
          // setEntity(result);
          // setEntity(prev => ({ ...prev, [_subType]: result }));
          setLoaded(prev => ({ ...prev, [_subType]: result }));
        } finally {
          setLoading(false);
        }
      }
    },
    [metaType, defaultValue],
  );

  useEffect(() => {
    load(subType);
  }, [subType, load]);

  useEffect(() => {
    const Entity = loaded?.[subType];
    if (Entity) setEntity(Entity);
  }, [subType, loaded]);

  return {
    loading,
    // Entity: Entity?.[subType]?.default,
    Entity: Entity?.default,
  };
};
