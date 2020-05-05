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

// const wait = async (ms: number = 0): Promise<void> => new Promise(r => setTimeout(r, ms));

export const getAllNamespacedPods = async (kc: KubeConfig): Promise<Pod[]> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const { body: { items: podResponse } } = await kc
            .makeApiClient(CoreV1Api)
            .listPodForAllNamespaces();
        const pods: Pod[] = podResponse.map((pod: V1Pod) => Pod.buildFromV1Pod(pod));
        isRequestTimeout();
        return pods;
    } catch (error) {
        throw error;
    }
}

export const getNamespacedPods = async (kc: KubeConfig, namespace: string): Promise<Pod[]> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const api = kc.makeApiClient(CoreV1Api);
        const { body: { items } } = await api.listNamespacedPod(namespace);
        const pods: Pod[] = items.map((pod: V1Pod) => Pod.buildFromV1Pod(pod));
        isRequestTimeout();
        return pods;
    } catch (error) {
        throw error;
    }
}

export const getNamespacedPodFromName = async (kc: KubeConfig, name: string, namespace: string): Promise<Pod> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const api = kc.makeApiClient(CoreV1Api);
        const pod: Pod = await Pod.buildFromV1Pod((await api.readNamespacedPod(name, namespace)).body);
        isRequestTimeout();
        return pod;
    } catch (error) {
        throw error.message
    }
}