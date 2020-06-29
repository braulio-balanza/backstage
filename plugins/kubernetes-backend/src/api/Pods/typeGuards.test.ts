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
import { V1Pod, V1PodSpec, V1PodStatus } from '@kubernetes/client-node';
import { decodePodSpec, decodePodStatus, decodePod } from './typeGuards'
import { Pod } from './models'
import { loadFixture } from '../utils/testUtils'

const { body: POD_RAW }: { body: V1Pod } = loadFixture('Pods', 'podResponseFixture.json');

describe('tests typeguards', () => {
    const testPod: Pod = Pod.buildFromV1PodJSON(POD_RAW)
    const status: unknown = testPod.getStatus();
    const spec: unknown = testPod.getSpec();
    describe('tests the V1PodSpec type guard', () => {
        it('returns the spec as a V1PodSpec', () => {
            expect(spec).toBeInstanceOf(V1PodSpec);
        });
        it('gives error if object not a V1PodSpec', () => {
            expect(() => decodePodSpec(status)).toThrowError('Error decoding V1PodSpec');
        })
    });
    describe('tests the V1PodStatus type guard', () => {
        it('returns the status as a V1PodStatus', () => {
            expect(status).toBeInstanceOf(V1PodStatus);
        });
        it('gives error if object not a V1PodStatus', () => {
            expect(() => decodePodStatus(spec)).toThrowError('Error decoding V1PodStatus');
        })
    });
    describe('tests the V1Pod type guard', () => {
        it('returns the Pod as a V1Pod', () => {
            expect(decodePod(testPod)).toBeInstanceOf(V1Pod);
        });
        it('gives error if object not a V1PodStatus', () => {
            expect(() => decodePod(spec)).toThrowError('Error decoding V1Pod');
        })
    });
});