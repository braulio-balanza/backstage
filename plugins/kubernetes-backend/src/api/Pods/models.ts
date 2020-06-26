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
import { Type, success, failure, Context } from "io-ts/lib";
import { isKubeObject, isPluginObject } from '../utils/utils';
import { pipe } from "fp-ts/lib/pipeable";
import { fold } from 'fp-ts/lib/Either'
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
    name?: string;
    kind?: string;
    apiVersion?: string;
    metadata?: V1ObjectMeta
    spec?: V1PodSpec;
    status?: V1PodStatus;
}

export const V1PodStatusGuard = new Type<
    V1PodStatus,
    string,
    unknown
>(
    'V1PodStatus',
    (input: unknown): input is V1PodStatus => isKubeObject(input, V1PodStatus),
    (input: unknown, context: Context) =>
        isKubeObject(input, V1PodStatus)
            ? success(Object.assign(new V1PodStatus, input))
            : failure(input, context, "Error decoding V1PodStatus"),
    (status: V1PodStatus): string => JSON.stringify(status),
)
export const decodePodStatus = (input: unknown): V1PodStatus | undefined =>
    input
        ? pipe(V1PodStatusGuard.decode(input),
            fold(
                errors => { errors.forEach(error => { throw new Error(error.message) }); return undefined },
                status => status
            ))
        : undefined;


export const V1PodSpecGuard = new Type<
    V1PodSpec,
    string,
    unknown
>(
    'V1PodSpec',
    (input: unknown): input is V1PodSpec => isKubeObject(input, V1PodSpec),
    (input: unknown, context: Context) => isKubeObject(input, V1PodSpec)
        ? success(Object.assign(new V1PodSpec, input))
        : failure(input, context, 'Error decoding V1PodSpec'),
    (spec: V1PodSpec) => JSON.stringify(spec),
)

export const decodePodSpec = (input: unknown): V1PodSpec | undefined =>
    input
        ? pipe(V1PodSpecGuard.decode(input),
            fold(
                errors => { errors.forEach(error => { throw new Error(error.message) }); return undefined },
                spec => spec
            ))
        : undefined;



export class Pod extends K8sObject {

    static build(params: IPod): Pod {
        return new Pod(
            params.name,
            params.kind,
            params.apiVersion,
            params.status,
            params.metadata,
            params.spec
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
            metadata: this.metadata as V1ObjectMeta,
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
        const containerStatuses = this.getStatus()?.containerStatuses;
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
        public name?: string,
        public kind?: string,
        public apiVersion?: string,
        status?: V1PodStatus,
        metadata?: V1ObjectMeta,
        spec?: V1PodSpec,
    ) {
        super(metadata, decodePodSpec(spec), decodePodStatus(status))
    };

}

export const PodGuard = new Type<
    V1Pod,
    string,
    unknown
>(
    'V1Pod',
    (input: unknown): input is V1Pod => isPluginObject(input, new Pod),
    (input: unknown, context) => isPluginObject(input, new Pod)
        ? success(Object.assign(new V1Pod, input))
        : failure(input, context, 'Error decoding V1PodSpec'),
    (pod: V1Pod) => JSON.stringify(pod),
)
export const decodePod = (input: unknown): V1Pod | undefined =>
    input
        ? pipe(PodGuard.decode(input),
            fold(
                errors => { errors.forEach(error => { throw new Error(error.message) }); return undefined },
                status => status
            ))
        : undefined;