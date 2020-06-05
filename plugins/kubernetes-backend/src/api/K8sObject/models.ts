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
import { Type, Context, failure, success } from 'io-ts/lib'
import { fold } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { getKeysFromTypeMap } from '../utils/utils'

export type Labels = { [key: string]: string };

export type K8sSpec = k8s.V1PodSpec | k8s.V1NodeSpec | k8s.V1DeploymentSpec | k8s.V1ServiceSpec | k8s.V1NamespaceSpec;

export type K8sStatus = k8s.V1PodStatus | k8s.V1NodeStatus | k8s.V1DeploymentStatus | k8s.V1ServiceStatus | k8s.V1NamespaceStatus;

export type meta = k8s.V1ObjectMeta | k8s.V1ListMeta;



export const V1ObjectMetaGuard = new Type<
    k8s.V1ObjectMeta,
    string,
    unknown
>(
    'V1ObjectMeta',
    (unknown: unknown): unknown is k8s.V1ObjectMeta => {
        if (!(unknown instanceof Object))
            return false;
        const V1ObjectMetaKeys = getKeysFromTypeMap(k8s.V1ObjectMeta.getAttributeTypeMap());
        const unknownObjectKeys = Object.keys(unknown);
        return unknownObjectKeys.length ? unknownObjectKeys.every(key => V1ObjectMetaKeys.includes(key)) : false
    },
    (input: unknown, context: Context) => {
        if (!(input instanceof Object))
            return failure(input, context);
        const V1ObjectMetaKeys = getKeysFromTypeMap(k8s.V1ObjectMeta.getAttributeTypeMap());
        const inputObjectKeys = Object.keys(input);
        return inputObjectKeys.length && inputObjectKeys.every(key => V1ObjectMetaKeys.includes(key))
            ? success(Object.assign(new k8s.V1ObjectMeta, input))
            : failure(input, context);
    },
    (meta: k8s.V1ObjectMeta): string => {
        return JSON.stringify(meta as k8s.V1ObjectMeta);
    },
)


export interface IK8sObject {
    metadata?: k8s.V1ObjectMeta;
    spec?: K8sSpec;
    status?: K8sStatus;
}

export class K8sObject implements IK8sObject {

    static build(params: IK8sObject): K8sObject {
        const meta = this.prototype.decodeObjectMetadata(params.metadata);
        return new K8sObject(
            meta,
            params.spec,
            params.status,
        );
    }

    public getLabels(): Labels | undefined {
        return this.metadata?.labels;
    };

    public decodeObjectMetadata(metadataToDecode: unknown): k8s.V1ObjectMeta | undefined {
        if(typeof metadataToDecode === 'undefined') return metadataToDecode;
        return pipe(V1ObjectMetaGuard.decode(metadataToDecode),
            fold(
                () => { throw new Error('Error decoding V1ObjectMeta') },
                content => content,
            ));
    }

    constructor(
        public metadata?: k8s.V1ObjectMeta,
        public spec?: K8sSpec,
        public status?: K8sStatus,
    ) {
        try {
            if (typeof metadata === 'undefined') this.metadata = metadata;
            else
                this.metadata = this.decodeObjectMetadata(metadata);
        } catch (e) {
            throw e.message;
        }
    }
}
