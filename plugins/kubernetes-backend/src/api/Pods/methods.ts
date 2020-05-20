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
import { isConfigEmpty, returnUndefinedArray, stringifyLabels } from '../utils/utils'
import { Labels } from '../K8sObject/models';
import { Pod } from './models'

export interface IGetAllNamespacedPods {
    labels?: Labels;
}

export const getAllNamespacedPods = async (kc: KubeConfig, options?: IGetAllNamespacedPods): Promise<Pod[]> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const api = kc.makeApiClient(CoreV1Api);
        const { body: { items } } = await api.listPodForAllNamespaces(...returnUndefinedArray(3), stringifyLabels(options?.labels));
        const pods: Pod[] = items.map((pod: V1Pod) => Pod.buildFromV1PodJSON(pod));
        return pods;
    } catch (error) {
        throw error;
    }
}

export interface IGetNamesacedPods {
    namespace: string;
    labels?: Labels;
}
export const getNamespacedPods = async (kc: KubeConfig, options: IGetNamesacedPods): Promise<Pod[]> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const api = kc.makeApiClient(CoreV1Api);
        const { body: { items } } = await api.listNamespacedPod(
            options.namespace,
            undefined,
            undefined,
            undefined,
            undefined,
            stringifyLabels(options.labels));
        const pods: Pod[] = items.map((pod: V1Pod) => Pod.buildFromV1PodJSON(pod));
        return pods;
    } catch (error) {
        throw error;
    }
}

export interface IGetNamesacedPodFromName {
    name: string;
    namespace: string;
}

export const getNamespacedPod = async (kc: KubeConfig, options: IGetNamesacedPodFromName): Promise<Pod> => {
    try {
        if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
        const api = kc.makeApiClient(CoreV1Api);
        const { body } = await api.readNamespacedPod(options.name, options.namespace);
        const pod: Pod = Pod.buildFromV1PodJSON(body);
        return pod;
    } catch (error) {
        throw error
    }
}