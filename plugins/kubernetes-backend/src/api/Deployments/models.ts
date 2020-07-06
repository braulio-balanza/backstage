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
import { K8sObject } from '../K8sObject/models'
import { V1ObjectMeta, V1DeploymentSpec, V1DeploymentStatus, V1Deployment } from '@kubernetes/client-node';
import { decodeMetadata } from 'api/K8sObject/typeGuards';
import { decodeDeploymentSpec, decodeDeploymentStatus } from './typeGuards';

interface IDeployment {
    kind?: string,
    apiVersion?: string,
    metadata?: V1ObjectMeta,
    spec?: V1DeploymentSpec,
    status?: V1DeploymentStatus,
}

export class Deployment extends K8sObject {

    static build = (params: IDeployment) => new Deployment(
        params.kind,
        params.apiVersion,
        params.metadata,
        params.spec,
        params.status
    )

    static buildFromJSON = (deployment: V1Deployment) => {
        const { kind, apiVersion, metadata, spec, status } = deployment;
        return Deployment.build({ kind, apiVersion, metadata, spec, status })
    }

    static buildFromJSONArray = (deployments: Array<V1Deployment>): Array<Deployment> =>
        deployments.map((deployment: V1Deployment) => Deployment.buildFromJSON(deployment))

    constructor(
        public kind?: string,
        public apiKind?: string,
        public metadata?: V1ObjectMeta,
        public spec?: V1DeploymentSpec,
        public status?: V1DeploymentStatus,
    ) { super(decodeMetadata(metadata), decodeDeploymentSpec(spec), decodeDeploymentStatus(status)) }
}