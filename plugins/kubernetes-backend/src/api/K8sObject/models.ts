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

import * as k8s from '@kubernetes/client-node'
import { V1ObjectMeta } from '@kubernetes/client-node';


export type Labels = { [key: string]: string };

export type K8sSpec = k8s.V1PodSpec | k8s.V1NodeSpec | k8s.V1DeploymentSpec | k8s.V1ServiceSpec | k8s.V1NamespaceSpec;

export type K8sStatus = k8s.V1PodStatus | k8s.V1NodeStatus | k8s.V1DeploymentStatus | k8s.V1ServiceStatus | k8s.V1NamespaceStatus;

export interface IK8sObject {
    metadata?: k8s.V1ObjectMeta;
    spec?: K8sSpec;
    status?: K8sStatus;
}

export class K8sObject implements IK8sObject {

    static build(params: IK8sObject): K8sObject {
        return new K8sObject(
            params.metadata,
            params.spec,
            params.status,
        );
    }

    public isObject() {
        return this.metadata instanceof V1ObjectMeta;
    }

    public getLabels(): Labels | undefined {
        return this.metadata?.labels;
    };
    constructor(
        public metadata?: k8s.V1ObjectMeta,
        public spec?: K8sSpec,
        public status?: K8sStatus,
    ) {
    }
}
