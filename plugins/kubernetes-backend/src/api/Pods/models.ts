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
import { IK8sObject, K8sObject } from "../K8sObject/models";
import { decodeMetadata } from '../K8sObject/typeGuards'
import { decodePodSpec, decodePodStatus } from './typeGuards'


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
    kind?: string;
    apiVersion?: string;
    metadata?: V1ObjectMeta
    spec?: V1PodSpec;
    status?: V1PodStatus;
}


export class Pod extends K8sObject {

    static build = (params: IPod): Pod => {
        return new Pod(
            params.kind,
            params.apiVersion,
            params.status,
            params.metadata,
            params.spec
        );
    }

    static buildFromJSON = (v1Pod: V1Pod): Pod => {
        const { kind, apiVersion, metadata, spec, status } = v1Pod;
        return Pod.build({ kind, apiVersion, metadata, spec, status });
    }

    static buildFromJSONArray = (v1PodList: Array<V1Pod>): Array<Pod> =>
        v1PodList.map((pod: V1Pod) => Pod.buildFromJSON(pod));

    public buildV1PodJSON = (): V1Pod => {
        return {
            kind: this.kind,
            apiVersion: this.apiVersion,
            metadata: this.getMetadata(),
            spec: this.getSpec(),
            status: this.getStatus(),
        };
    }

    public getContainers = (): V1Container[] | undefined => {
        const spec = this.spec as V1PodSpec;
        if (spec)
            return spec.containers;
        return undefined;
    }

    public getMetadata = (): V1ObjectMeta | undefined => {
        return this.metadata ? this.metadata as V1ObjectMeta : undefined;
    }

    public getSpec = (): V1PodSpec | undefined => {
        return this.spec ? this.spec as V1PodSpec : undefined;
    }

    public getStatus = (): V1PodStatus | undefined => {
        return this.status ? this.status as V1PodStatus : undefined;
    }
    public getContainersStatuses = (): Array<V1ContainerStatus> | undefined => {
        const containerStatuses = this.getStatus()?.containerStatuses;
        return containerStatuses ? containerStatuses : undefined;
    };

    public getContainersReady = (): string => {
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

    public getContainersRestarts = (): number => {
        const containerStatuses = this.getContainersStatuses();
        let restarts: number = 0;
        if (containerStatuses)
            restarts = containerStatuses.reduce((r, status) => r + status.restartCount, 0);
        return restarts;
    }

    public getPodIp = (): string => {
        const status = this.getStatus();
        return status?.podIP ? status.podIP : '';
    };

    public getNodeName = (): string => {
        const spec = this.getSpec();
        return spec?.nodeName ? spec.nodeName : '';
    }

    public getPodOverview = (): PodOverview => {
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
        public kind?: string,
        public apiVersion?: string,
        status?: V1PodStatus,
        metadata?: V1ObjectMeta,
        spec?: V1PodSpec,
    ) {
        super(decodeMetadata(metadata), decodePodSpec(spec), decodePodStatus(status))
    };

}