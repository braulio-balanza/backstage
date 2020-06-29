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
import { V1Pod, V1PodSpec, V1PodStatus } from "@kubernetes/client-node";
import { Type, success, failure, Context } from "io-ts/lib";
import { isKubeObject, isPluginObject, decodeObject } from '../utils/utils';
import { Pod } from './models'

export const V1PodStatusGuard = new Type<
    V1PodStatus,
    string,
    unknown
>(
    'V1PodStatus',
    (input: unknown): input is V1PodStatus => isKubeObject(input, V1PodStatus),
    (input: unknown, context: Context) => isKubeObject(input, V1PodStatus)
        ? success(Object.assign(new V1PodStatus, input))
        : failure(input, context, "Error decoding V1PodStatus"),
    (status: V1PodStatus): string => JSON.stringify(status),
)

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
export const decodePodStatus = (input: unknown): V1PodStatus | undefined => decodeObject(input, V1PodStatusGuard)
export const decodePodSpec = (input: unknown): V1PodSpec | undefined => decodeObject(input, V1PodSpecGuard);
// Possible circular dependency? PodGuard Needs Pod defined bellow.
export const decodePod = (input: unknown): V1Pod | undefined => decodeObject(input, PodGuard)