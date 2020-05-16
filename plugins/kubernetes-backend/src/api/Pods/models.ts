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

import { V1Pod, V1PodSpec, V1PodStatus, V1ObjectMeta } from "@kubernetes/client-node";
import { IK8sObject, K8sObject } from "../K8sObject/models"
// import YAML from 'yaml';

export interface PodOverview {
    name: string,
    application?: string,
    containersReady: number,
    restarts: number,
    age: number,
    ip: string,
    node: string,
    created: Date,
}


export interface IPod extends IK8sObject {
    name: string;
    kind?: string;
    apiVersion?: string;
    metadata?: V1ObjectMeta;
    spec?: V1PodSpec;
    status?: V1PodStatus;
}

export class Pod extends K8sObject {

    static build(params: IPod): Pod {
        return new Pod(
            params.name,
            params.kind,
            params.apiVersion,
            params.metadata as V1ObjectMeta,
            params.spec,
            params.status,
        );
    }

    static buildFromV1Pod(v1Pod: V1Pod): Pod {
        const { kind, apiVersion, metadata, spec, status } = v1Pod;
        const name: string = metadata?.name ? metadata.name : "";
        return Pod.build({ name, kind, apiVersion, metadata, spec, status });
    }

    static buildFromV1PodArray(v1PodList: V1Pod[]): Pod[] {
        const pods: Pod[] = new Array<Pod>();
        v1PodList.map((pod: V1Pod) => pods.push(Pod.buildFromV1Pod(pod)));
        return pods;
    }

    public buildV1Pod(): V1Pod {
        return {
            kind: this.kind,
            apiVersion: this.apiVersion,
            metadata: this.metadata,
            spec: this.spec as V1PodSpec,
            status: this.status as V1PodStatus,
        };
    }

    constructor(
        public name: string,
        public kind?: string,
        public apiVersion?: string,
        metadata?: V1ObjectMeta,
        spec?: V1PodSpec,
        status?: V1PodStatus,
    ) {
        super(metadata, spec, status)
    };

} 