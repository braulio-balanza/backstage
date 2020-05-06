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
import { KubeConfig } from '@kubernetes/client-node';
import { isConfigEmpty, isRequestTimeout } from './utils'

describe('Util functions general testing', () => {
    describe('isConfigEmpty works properly', () => {
        it('isConfigEmpty returns true when KubeConfig is empty', () => {
            const emptyKubeConfigFile: KubeConfig = new KubeConfig();
            const kubeConfigWithNoValues: KubeConfig = new KubeConfig();
            kubeConfigWithNoValues.loadFromOptions({ clusters: [], users: [], contexts: [] })
            expect(isConfigEmpty(emptyKubeConfigFile) && isConfigEmpty(kubeConfigWithNoValues)).toBe(true)
        });
    });
    describe('isRequestTimeout work properly', () => {
        it('throws error if requests times out', async () => {
            await expect(isRequestTimeout(0))
                .rejects
                .toThrowError('Request timed out.');
        }, 100)
    })
})
