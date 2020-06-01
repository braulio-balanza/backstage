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
import { IK8sObject, K8sObject, V1ObjectMeta as ObjectMetaTypeGuard } from "../K8sObject/models"
import { fold } from "fp-ts/lib/Either";
import { pipe } from 'fp-ts/lib/pipeable';
import { Errors as ioErrors } from 'io-ts';
// import YAML from 'yaml';

export interface PodOverview {
    name: string,
    containersReady: string,
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

    public getMetadata(): V1ObjectMeta {
        const spec = <V1ObjectMeta>(this.spec);
        return spec as V1ObjectMeta
    }

    public getContainersStatuses = (): Array<V1ContainerStatus> | undefined => {
        const containerStatuses = (this.status as V1PodStatus).containerStatuses;
        return containerStatuses ? containerStatuses : undefined;
    };

    public getContainersReady(): String {
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
        const meta: V1ObjectMeta = pipe(
            ObjectMetaTypeGuard.decode(this.metadata),
            fold(
                (e: ioErrors) => { throw e },
                (metadata: V1ObjectMeta) => metadata
            )
        );
        const timestamp = meta.creationTimestamp
        return timestamp ? new Date(timestamp) : undefined
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