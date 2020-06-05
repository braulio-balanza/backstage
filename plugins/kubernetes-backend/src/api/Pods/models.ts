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

import { V1Pod, V1PodSpec, V1PodStatus, V1ContainerStatus, V1ObjectMeta, V1Container } from "@kubernetes/client-node";
import { IK8sObject, K8sObject } from "../K8sObject/models"
// import YAML from 'yaml';

export interface PodOverview {
    name?: string,
    containersReady: string,
    restarts: number,
    created?: Date,
    age?: number,
    ip: string,
    node: string,
}


export interface IPod extends IK8sObject {
    name: string;
    kind?: string;
    apiVersion?: string;
    metadata?: V1ObjectMeta
    spec?: V1PodSpec;
    status?: V1PodStatus;
}

export class Pod extends K8sObject {

    static build(params: IPod): Pod {
        return new Pod(
            params.name,
            params.kind,
            params.apiVersion,
            params.metadata,
            params.spec as V1PodSpec,
            params.status as V1PodStatus,
        );
    }


    static buildFromV1PodJSON(v1Pod: V1Pod): Pod {
        const { kind, apiVersion, metadata, spec, status } = v1Pod;
        const name: string = metadata?.name ? metadata.name : "";
        return Pod.build({ name, kind, apiVersion, metadata, spec, status });
    }

    static buildFromV1PodJSONArray(v1PodList: V1Pod[]): Pod[] {
        const pods: Pod[] = new Array<Pod>();
        v1PodList.map((pod: V1Pod) => pods.push(Pod.buildFromV1PodJSON(pod)));
        return pods;
    }

    public buildV1PodJSON(): V1Pod {
        return {
            kind: this.kind,
            apiVersion: this.apiVersion,
            metadata: this.metadata,
            spec: this.spec as V1PodSpec,
            status: this.status as V1PodStatus,
        };
    }

    public getContainers(): V1Container[] | undefined {
        const spec = this.spec as V1PodSpec;
        if (spec)
            return spec.containers;
        return undefined;
    }

    public getMetadata(): V1ObjectMeta | undefined {
        return this.metadata ? this.metadata as V1ObjectMeta : undefined;
    }

    public getSpec(): V1PodSpec | undefined {
        return this.spec ? this.spec as V1PodSpec : undefined;
    }

    public getStatus(): V1PodStatus | undefined {
        return this.status ? this.status as V1PodStatus : undefined;
    }
    public getContainersStatuses = (): Array<V1ContainerStatus> | undefined => {
        const containerStatuses = (this.status as V1PodStatus).containerStatuses;
        return containerStatuses ? containerStatuses : undefined;
    };

    public getContainersReady(): string {
        const containerStatuses = this.getContainersStatuses();
        let ready: number = 0;
        let total: number = 0;
        if (containerStatuses)
            [ready, total] = containerStatuses.reduce(([r, t], status) => [
                status.ready ? r + 1 : r,
                t + 1
            ], [0, 0])
        return `${ready}/${total}`
    }

    public getContainersRestarts(): number {
        const containerStatuses = this.getContainersStatuses();
        let restarts: number = 0;
        if (containerStatuses)
            restarts = containerStatuses.reduce((r, status) => r + status.restartCount, 0);
        return restarts;
    }

    public getCreatedAt(): Date | undefined {
        const timestamp = this.metadata?.creationTimestamp
        return timestamp ? new Date(timestamp) : undefined
    }

    public getAge(): number | undefined {
        const createdAt = this.getCreatedAt();
        return createdAt ? Date.now() - createdAt.getSeconds() : undefined;
    }
    public getPodIp(): string {
        const status = this.getStatus();
        return status?.podIP ? status.podIP : '';
    };

    public getNodeName(): string {
        const spec = this.getSpec();
        return spec?.nodeName ? spec.nodeName : '';
    }
    public getPodOverview(): PodOverview {
        const overview: PodOverview = {
            name: this.getMetadata()?.name,
            containersReady: this.getContainersReady(),
            restarts: this.getContainersRestarts(),
            age: this.getAge(),
            ip: this.getPodIp(),
            node: this.getNodeName(),
            created: this.getCreatedAt(),
        }
        return overview;
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