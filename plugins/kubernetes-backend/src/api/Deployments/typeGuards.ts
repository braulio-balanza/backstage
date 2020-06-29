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
import { Type, success, failure, Context } from 'io-ts';
import { V1DeploymentSpec } from '@kubernetes/client-node';
import { isKubeObject, decodeResultHandler } from '../utils/utils'

export const V1DeploymentSpecGuard = new Type<
    V1DeploymentSpec,
    string,
    unknown
>(
    'V1DeploymentSpec',
    (input: unknown): input is V1DeploymentSpec => isKubeObject(input, V1DeploymentSpec),
    (input: unknown, context: Context) => isKubeObject(input, V1DeploymentSpec)
        ? success(Object.assign(new V1DeploymentSpec, input))
        : failure(input, context, 'Error decoding V1DeploymentSpec'),
    (spec: V1DeploymentSpec) => JSON.stringify(spec));

export const decodeDeploymentSpec = (input: unknown) => decodeResultHandler(input, V1DeploymentSpecGuard);