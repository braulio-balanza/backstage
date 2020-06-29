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

import { V1ObjectMetaGuard } from './typeGuards'
import { V1ListMeta } from '@kubernetes/client-node'
import { loadFixture } from '../utils/testUtils'

const KUBE_META_OBJECT = loadFixture('K8sObject', 'V1ObjectMeta.json');

describe('test object meta typeguard', () => {
    it('decodes an object meta string', () => {
        expect(V1ObjectMetaGuard.is(KUBE_META_OBJECT)).toBeTruthy();
    })
    it('rejects an object that isn`t a V1ObjectMeta', () => {
        const wrongObject: V1ListMeta = { 'remainingItemCount': 0, 'resourceVersion': 'test', 'selfLink': 'test' };
        expect(V1ObjectMetaGuard.is(wrongObject)).toEqual(false);
    })
})