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
import { Labels } from '../K8sObject/models'
import { isConfigEmpty, stringifyLabels, returnUndefinedArray } from './utils'

describe('Util functions general testing', () => {
    describe('isConfigEmpty works properly', () => {
        it('isConfigEmpty returns true when KubeConfig is empty', () => {
            const emptyKubeConfigFile: KubeConfig = new KubeConfig();
            const kubeConfigWithNoValues: KubeConfig = new KubeConfig();
            kubeConfigWithNoValues.loadFromOptions({ clusters: [], users: [], contexts: [] })
            expect(isConfigEmpty(emptyKubeConfigFile) && isConfigEmpty(kubeConfigWithNoValues)).toBe(true)
        });
    });
    describe('tests stringifyLabels', () => {
        const exampleLabelString = 'app=nginx,test=new-test';
        const exampleLabels: Labels = { "app": "nginx", "test": "new-test" };
        it('returns labels in the correct format', () => {
            expect(stringifyLabels(exampleLabels)).toEqual(exampleLabelString);
        })
        it('returns empty string if empty label array', () => {
            expect(stringifyLabels({})).toEqual('');
        })
    });
    describe('tests fillUndefinedParams', () => {
        const undefinedArray: undefined[] = new Array<undefined>(4);
        it('returns an array with the correct number of undefined', () => {
            expect(returnUndefinedArray(4)).toEqual(undefinedArray);
        })
    })
})
