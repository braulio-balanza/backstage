/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { KubeConfig, CoreV1Api, V1Pod } from '@kubernetes/client-node'
import { isConfigEmpty, isRequestTimeout } from '../utils'
import { Pod } from './models'


export const getAllNamespacedPods = async (kc: KubeConfig): Promise<Pod[]> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const api = kc.makeApiClient(CoreV1Api);
        const { body: { items } } = await api.listPodForAllNamespaces();
        isRequestTimeout();
        const pods: Pod[] = items.map((pod: V1Pod) => Pod.buildFromV1Pod(pod));
        return pods;
    } catch (error) {
        throw error;
    }
}

export interface IGetNamesacedPods {
    namespace: string;
}
export const getNamespacedPods = async (kc: KubeConfig, options: IGetNamesacedPods): Promise<Pod[]> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const api = kc.makeApiClient(CoreV1Api);
        const { body: { items } } = await api.listNamespacedPod(options.namespace);
        isRequestTimeout();
        const pods: Pod[] = items.map((pod: V1Pod) => Pod.buildFromV1Pod(pod));
        return pods;
    } catch (error) {
        throw error;
    }
}

export interface IGetNamesacedPodFromName {
    name: string;
    namespace: string;
}

export const getNamespacedPodFromName = async (kc: KubeConfig, options: IGetNamesacedPodFromName): Promise<Pod> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const api = kc.makeApiClient(CoreV1Api);
        const { body } = await api.readNamespacedPod(options.name, options.namespace);
        const pod: Pod = Pod.buildFromV1Pod(body);
        isRequestTimeout();
        return pod;
    } catch (error) {
        throw error
    }
}