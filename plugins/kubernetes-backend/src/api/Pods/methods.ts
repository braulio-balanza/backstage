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
import { V1Pod } from '@kubernetes/client-node'
import { ApiRoot } from 'kubernetes-client';
import { stringifyLabels } from '../utils/utils'
import { Labels } from '../K8sObject/models';
import { Pod } from './models'

export interface IGetAllNamespacedPods {
    labels?: Labels;
}

export const getAllNamespacedPods = async (client: ApiRoot, options?: IGetAllNamespacedPods): Promise<Pod[]> => {
    try {
        const { body } = await client.api.v1.pods.get({ qs: { labelSelector: stringifyLabels(options?.labels) } });
        const pods: Pod[] = body.items.map((pod: V1Pod) => {
            pod.kind = 'Pod';
            pod.apiVersion = body.apiVersion;
            return Pod.buildFromJSON(pod)
        });
        return pods;
    } catch (error) {
        throw error;
    }
}

export interface IGetNamesacedPods {
    namespace: string;
    labels?: Labels;
}
export const getNamespacedPods = async (client: ApiRoot, options: IGetNamesacedPods): Promise<Pod[]> => {
    try {
        const { body } = await client.api.v1.
            namespaces(options.namespace).
            pods.
            get({ qs: { labelSelector: stringifyLabels(options?.labels) } });
        const pods: Pod[] = body.items.map((pod: V1Pod) => Pod.buildFromJSON(pod));
        return pods;
    } catch (error) {
        throw error;
    }
}

export interface IGetNamesacedPodFromName {
    name: string;
    namespace: string;
}

export const getNamespacedPod = async (client: ApiRoot, options: IGetNamesacedPodFromName): Promise<Pod> => {
    try {
        const { body } = await client.api.v1.namespaces(options.namespace).pods(options.name).get();
        const pod: Pod = Pod.buildFromJSON(body);
        return pod;
    } catch (error) {
        throw error
    }
}