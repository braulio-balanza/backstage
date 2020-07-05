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
import { V1PodSpec, V1PodStatus } from "@kubernetes/client-node";
import { Type, Context } from "io-ts/lib";
import { isKubeObject, isPluginObject, decodeResultHandler, decodeObject } from '../utils/utils';
import { Pod } from './models'

export const V1PodStatusGuard = new Type<
    V1PodStatus,
    string,
    unknown
>(
    'V1PodStatus',
    (input: unknown): input is V1PodStatus => isKubeObject(input, V1PodStatus),
    (input: unknown, context: Context) => decodeObject(input, V1PodStatus, context, "Error decoding V1PodStatus"),
    (status: V1PodStatus): string => JSON.stringify(status),
)

export const V1PodSpecGuard = new Type<
    V1PodSpec,
    string,
    unknown
>(
    'V1PodSpec',
    (input: unknown): input is V1PodSpec => isKubeObject(input, V1PodSpec),
    (input: unknown, context: Context) => decodeObject(input, V1PodSpec, context, "Error decoding V1PodSpec"),
    (spec: V1PodSpec) => JSON.stringify(spec),
)

export const PodGuard = new Type<
    Pod,
    string,
    unknown
>(
    'Pod',
    (input: unknown): input is Pod => isPluginObject(input, new Pod),
    (input: unknown, context) => decodeObject(input, Pod, context, "Error decoding Pod"),
    (pod: Pod) => JSON.stringify(pod),
)
// TODO do we need a V1Pod guard?

export const decodePodStatus = (input: unknown): V1PodStatus | undefined => decodeResultHandler(input, V1PodStatusGuard)
export const decodePodSpec = (input: unknown): V1PodSpec | undefined => decodeResultHandler(input, V1PodSpecGuard);
// Possible circular dependency? PodGuard Needs Pod defined above.
export const decodePod = (input: unknown): Pod | undefined => decodeResultHandler(input, PodGuard)