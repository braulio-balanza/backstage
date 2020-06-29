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

import { V1ObjectMeta } from '@kubernetes/client-node';
import { Type, Context, failure, success } from 'io-ts/lib'
import { isKubeObject, decodeObject } from '../utils/utils';

export const V1ObjectMetaGuard = new Type<
    V1ObjectMeta,
    string,
    unknown
>(
    'V1ObjectMeta',
    (unknown: unknown): unknown is V1ObjectMeta =>
        isKubeObject(unknown, V1ObjectMeta),
    (input: unknown, context: Context) =>
        isKubeObject(input, V1ObjectMeta)
            ? success(Object.assign(new V1ObjectMeta, input))
            : failure(input, context),
    (meta: V1ObjectMeta): string => JSON.stringify(meta),
)
export const decodeMetadata = (input: unknown): V1ObjectMeta | undefined => decodeObject(input, V1ObjectMetaGuard)